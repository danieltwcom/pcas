// ---------------Require all modules
const express = require("express");
const session = require('cookie-session');
const dotenv = require('dotenv').config();
const bodyParser = require("body-parser");
const path = require("path");
const pg = require("pg");
const multer = require('multer');

// ------------Server variables setup
const port = process.env.SERVER_PORT || 56789;
var app = express();
const server = require("http").createServer(app);
var pF = path.resolve(__dirname, "html");

//----------------PostgrSQL connection---------------
var pool = new pg.Pool({
    user: process.env.PGSQL_USER,
    host: process.env.PGSQL_HOST,
    password:process.env.PGSQL_PASSWORD,
    database: process.env.PGSQL_DATABASE,
	max:process.env.PGSQL_MAX,
    port: process.env.DB_PORT
});

// initialize body parser
app.use(bodyParser.urlencoded({
    extended: true
}));

// multer storage configuration
var storage = multer.diskStorage({
    destination: 'users-file/',
    filename: function(req, file, cb) {
        cb(null, req.session.user_id + '-profile-pic.jpg')
    }
});

var upload = multer({ storage: storage });

//-------------Sessions setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Initializing PUG template
app.set('view engine', 'pug');
app.set('views', ['templates', 'templates/inc', 'templates/blocks', 'templates/dev']);

// Route folders
app.use("/style", [express.static("css"), express.static("css/vendor")]);
app.use("/scripts", [express.static("scripts"), express.static("scripts/vendor")]);
app.use("/image", express.static("image"));
app.use("/inc", express.static("inc"));
app.use('/fonts', express.static('fonts'));
app.use('/files', express.static('users-file'));

// ----------- Regex format --------------------
var usernameRegex = /^[a-zA-Z0-9\-_]{4,20}$/;
var stringRegex = /^[a-zA-Z0-9\-_]{1,15}$/;
var emailRegex = /^[a-zA-Z0-9\._\-]{1,50}@[a-zA-Z0-9_\-]{1,50}(.[a-zA-Z0-9_\-])?.(ca|com|org|net|info|us|cn|co.uk|se)$/;
var passwordRegex = /^[^ \s]{4,15}$/;
// -----------Regex format end -------------------


// -----------Register ---------------------------
app.post("/register", function(req, resp) {
	console.log(req.body)
    pool.query( 'INSERT INTO users(username,password,email,first_name,last_name,role,phone_number,email_notification,is_verified,description,other_phone) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',[req.body.username,req.body.pass,req.body.email,req.body.fname,req.body.lname,req.body.job,req.body.phone,1,1,req.body.desp,req.body.otherPhone],(err,res) => {
		console.log(err,res)
		if(err){
			console.log(err)
		} 
		if(res != undefined && res.rowCount == 1){
			resp.send({status:"success"})	
		}
	})
});

// ------------Register End -------------------
//-------------Login --------------------------
app.post("/login", function(req, resp) {
    console.log(req.body)
	pool.query('SELECT * FROM users WHERE username = $1 and password = $2',[req.body.username,req.body.password],(err,res) => {
		console.log(err,res)
		if (res != undefined && res.rows.length > 0){
			
			if(res.rows[0].is_verified == 1){
                req.session = res.rows[0];
                console.log(req.session);
                resp.redirect('/postings');
			} else {
				resp.render('blocks/login',{message:"Your account is not verified"})
			}
		}
	})
});
//-------------Login End ----------------------

//------------------ Routes
app.get("/", function (req, resp) {
    if (req.session.username) {
        resp.redirect('/postings');
    } else {
        resp.render('blocks/login');
    }
});

app.get('/profile/:userid', function(req, resp) {
    if (req.session.username) {
        pool.query('SELECT * FROM users WHERE user_id = $1', [req.params.userid], function(err, result) {
            if (err) { console.log(err); }

            if (result !== undefined && result.rows.length > 0) {
                resp.render('blocks/profile', {user: result.rows[0]});
            }
        })
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/edit-profile', function(req, resp) {
    if (req.session.username) {
        resp.render('blocks/edit-profile', {user: req.session});
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/postings', function(req, resp) {
    if (req.session.username) {
        pool.query('SELECT * FROM coord_postings JOIN users ON coord_postings.user_id = users.user_id ORDER BY coord_postings.date_created ASC', function(err, c_result) {
            if (err) { console.log(err); }

            pool.query('SELECT * FROM ti_postings JOIN users ON ti_postings.user_id = users.user_id WHERE status = true ORDER BY ti_postings.date_created ASC', function(err, ti_result) {
                if (err) { console.log(err); }

                let coord_postings = c_result.rows;
                let ti_postings = ti_result.rows;

                resp.render('postings', {user: req.session, coord_postings: coord_postings, ti_postings: ti_postings});
            });
        });
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/my-applications', function(req, resp) {
    if (req.session.username) {
        resp.render('blocks/my-applications', {user: req.session});
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/my-posts', function(req, resp) {
    if (req.session.username) {
        resp.render('blocks/my-posts', {user: req.session});
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/posting-details/:postid', function(req, resp) {
    if (req.session.username) {
        pool.query('SELECT * FROM coord_postings JOIN users ON users.user_id = coord_postings.user_id WHERE post_id = $1', [req.params.postid], function(err, result) {
            if (err) { console.log(err); }

            var coordPosting = result.rows[0];

            pool.query('SELECT * FROM applicants JOIN users ON users.user_id = applicants.user_id WHERE applicants.post_id = $1', [req.params.postid], function(err, result) {
                if (err) { console.log(err); }

                var applicantsList = result.rows;
                console.log(req.session);
                console.log(applicantsList);
                var applicantsID = [14,15,16];

                for (let applicant of result.rows) {
                    applicantsID.push(applicant.user_id);
                }

                var listString = '(' + applicantsID.toString() + ')';

                pool.query('SELECT * FROM upvotes WHERE voted_user_id IN ' + listString, function(err, result) {
                    if (err) { console.log(err); }

                    var upvotesList = result.rows;

                    resp.render('posting-details', {user: req.session, post: coordPosting, applicant: applicantsList, upvote: upvotesList});
                });
            });
        });
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/register', function(req, resp) {
    if (req.session.username) {
        resp.render('postings', {user: req.session});
    } else {
        resp.render('blocks/register');
    }
});

app.get('/inbox', function(req, resp) {
    if (req.session.username) {
        resp.render('blocks/inbox', {user: req.session});
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});


app.get('/message', function(req, resp) {
    if (req.session.username) {
        resp.render('dev/message', {user: req.session});
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/create-post', function(req, resp) {
    console.log(req.session);
    if (req.session.username) {
        resp.render('blocks/create-post', {user: req.session});
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

//--- Non-Routes
app.get('/get-schools', function(req, resp) {
    pool.query('SELECT name FROM schools ORDER BY name', function(err, result) {
        if (err) { console.log(err); }

        resp.send(result.rows);
    });
});
//--- End Non-Routes

app.get('/post-created', function(req, resp) {
    if (req.session.username) {
        resp.render('blocks/post-created', {message: 'Post successfully created'});
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.post('/upload-profile-pic', function(req, resp) {
    let uploadProfilePic = upload.single('profile_pic');

    uploadProfilePic(req, resp, function(err) {
        console.log(req.file);
        console.log(req.body);
        if (err) { console.log(err); }
        
        if (req.file.size > 2000000) {
            resp.send({status: 'filesize too big'});
        }

        if (req.file.mimetype === 'image/png' || req.file.mimetype === 'image/gif' || req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/jpg' || req.file.mimetype === 'application/pdf') {
            let avatarURL = req.session.user_id + '-profile-pic.jpg';

            pool.query('UPDATE users SET avatar_url = $1 WHERE user_id = $2 RETURNING avatar_url', [avatarURL, req.session.user_id], function(err, result) {
                if (err) { console.log(err); }
                
                req.session.avatar_url = result.rows[0].avatar_url;
                resp.redirect('/profile');
            })
        } else {
            resp.send({status: 'invalid file type'});
        }
    });
});

app.post('/upload-credential', upload.single('credential'), function(req, resp) {
    console.log(req.file);
});

app.post('/apply', function(req, resp) {
    pool.query('INSERT INTO applicants (user_id, post_id, comments) VALUES($1, $2, $3) RETURNING post_id', [req.body.user_id, req.body.post_id, req.body.comment], function(err, result) {
        if (err) { console.log(err); }

        if (result !== undefined && result.rows.length > 0) {
            resp.redirect('/posting-details/' + result.rows[0].post_id);
        }
    });
});

app.get('/logout', function(req, resp) {
    req.session = null;

    resp.redirect('/');
});

// Create
app.post('/new-post', function(req, resp) {
    console.log(req.body);
    if (req.session.role === 'coordinator') {
        if (req.body.is_verified) {
            var isVerified = true;
        } else {
            var isVerified = false;
        }

        if (req.body.is_screened) {
            var isScreened = true;
        } else {
            var isScreened = false;
        }

        if (req.body.hide_email) {
            var hideEmail = true;
        } else {
            var hideEmail = false;
        }

        if (req.body.hide_phone) {
            var hidePhone = true;
        } else {
            var hidePhone = false;
        }

        pool.query('INSERT INTO coord_postings (title, school, detail, user_id, type, num_of_interpreter, num_of_transcriber, verified, screened, on_what_day, hide_email, hide_phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)', [req.body.title, req.body.school, req.body.details, req.session.user_id, req.body.type, req.body.how_many_int, req.body.how_many_tra, isVerified, isScreened, req.body.when, hideEmail, hidePhone], function(err, result) {
            if (err) {
                console.log(err);
                resp.send({status: 'fail'});
            } else if (result !== undefined && result.rowCount > 0) {
                resp.send({status: 'success'});
            }
        });
    } else if (req.session.role === 'ti') {
        var daysAvailable = req.body.days.join(', ');

        console.log(daysAvailable)

        pool.query('INSERT INTO ti_postings (title, time_available, days_available, recurring, user_id, starting, details) VALUES ($1, $2, $3, $4, $5, $6, $7)', [req.body.title, req.body.time, daysAvailable, req.body.recurring, req.session.user_id, req.body.starting, req.body.details], function(err, result) {
            if (err) {
                console.log(err);
                resp.send({status: 'fail'});
            } else if (result !== undefined && result.rowCount > 0) {
                resp.send({status: 'success'});
            }
        });
    }
});

// --------------Server listening --------------
server.listen(port, function (err) {
    if (err) {
        console.log(err);
        return false;
    }
    console.log(port + " is running");
});
