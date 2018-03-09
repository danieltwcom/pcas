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
    console.log(req.body);
	pool.query('SELECT * FROM users WHERE username = $1 and password = $2',[req.body.username,req.body.password],(err,res) => {
        if (err) {console.log(err); }

        console.log(res);
        
		if (res != undefined && res.rows.length > 0){
			if(res.rows[0].is_verified == 1){
                req.session = res.rows[0];
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

app.get('/profile', function(req, resp) {
    var userId = req.query.user_id;

    if (req.session.username) {
        pool.query('SELECT * FROM users WHERE user_id = $1', [userId], function(err, result) {
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
        pool.query('SELECT * FROM coord_postings JOIN users ON coord_postings.user_id = users.user_id WHERE status = true ORDER BY coord_postings.date_created ASC', function(err, c_result) {
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
        if (req.session.role === 'coordinator') {
            var queryString = 'SELECT * FROM coord_postings WHERE user_id = $1 ORDER BY date_created';
        } else if (req.session.role === 'ti') {
            var queryString = 'SELECT * FROM ti_postings WHERE user_id = $1 ORDER BY date_created';
        }

        pool.query(queryString, [req.session.user_id], function(err, result) {
            if (err) { console.log(err); }

            console.log(result.rows);

            if (result !== undefined) {
                resp.render('blocks/my-posts', {user: req.session, posts: result.rows})
            }
        });
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/posting-details', function(req, resp) {
    var postId = req.query.post_id;
    var role = req.query.role;

    if (req.session.username) {
        if (role === 'coordinator') {
            pool.query('SELECT * FROM coord_postings JOIN users ON users.user_id = coord_postings.user_id WHERE post_id = $1', [postId], function(err, result) {
                if (err) { console.log(err); }
    
                if (result !== undefined && result.rows.length > 0) {
                    var coordPosting = result.rows[0];
    
                    pool.query('SELECT * FROM applicants JOIN users ON users.user_id = applicants.user_id WHERE applicants.post_id = $1 ORDER BY users.username', [postId], function(err, result) {
                        if (err) { console.log(err); }
        
                        if (result !== undefined) {
                            var applicantsList = result.rows;
                            var applicantsID = [];
                            console.log(applicantsID);

                            for (let applicant of result.rows) {
                                applicantsID.push(applicant.user_id);
                            }
            
                            var listString = '(' + applicantsID.toString() + ')';
            
                            pool.query('SELECT * FROM upvotes WHERE voted_user_id IN ' + listString, function(err, result) {
                                if (err) { console.log(err); }
                                
                                if (result !== undefined && result.rows.length > 0) {
                                    var upvotesList = result.rows;
                                } else {
                                    var upvotesList = [];
                                }
            
                                resp.render('blocks/c-posting-details', {user: req.session, post: coordPosting, applicant: applicantsList, upvote: upvotesList});
                            });
                        }
                    });
                }
            });
        } else if (role === 'ti') {
            pool.query('SELECT * FROM ti_postings JOIN users ON users.user_id = ti_postings.user_id WHERE post_id = $1', [postId], function(err, result) {
                if (err) { console.log(err); }
                console.log(result);

                if (result !== undefined && result.rows.length > 0) {
                    resp.render('blocks/ti-posting-details', {user: req.session, post: result.rows[0]});
                }
            });
        }
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

app.get('/edit-post', function(req, resp) {
    if (req.session.username) {
        if (req.session.role === 'coordinator') {
            var queryString = 'SELECT * FROM coord_postings WHERE post_id = $1';
        } else if (req.session.role === 'ti') {
            var queryString = 'SELECT * FROM ti_postings WHERE post_id = $1';
        }

        pool.query(queryString, [req.query.post_id], function(err, result) {
            if (err) { console.log(err); }

            if (result !== undefined) {
                resp.render('blocks/edit-post', {user: req.session, post: result.rows[0]});
            }
        })
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
})

//--- Non-Routes
app.get('/get-schools', function(req, resp) {
    pool.query('SELECT name FROM schools ORDER BY name', function(err, result) {
        if (err) { console.log(err); }

        resp.send(result.rows);
    });
});

app.get('/select-school', function(req, resp) {
    var postId = req.query.post_id;

    pool.query('SELECT school FROM coord_postings WHERE post_id = $1', [postId], function(err, result) {
        if (err) { console.log(err); }

        if (result !== undefined && result.rows.length > 0) {
            resp.send(result.rows[0].school);
        }
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

app.post('/apply-options', function(req, resp) {
    if (req.body.hide_phone) {
        var hidePhone = true;
    } else {
        var hidePhone = false;
    }

    if (req.body.hide_email) {
        var hideEmail = true;
    } else {
        var hideEmail = false;
    }

    if (req.body.email_notification) {
        var email = true;
    } else {
        var email = false;
    }

    pool.query('UPDATE users SET hide_phone = $1, hide_email = $2, email_notification = $3 WHERE user_id = $4 RETURNING *', [hidePhone, hideEmail, email, req.body.user_id], function(err, result) {
        if (err) {
            console.log(err);
            resp.send({status: 'fail'});
        } else if (result !== undefined) {
            console.log(result.rows)
            req.session = result.rows[0];
            resp.send({status: 'success'});
        }
    });
});

app.post('/submit-edit-post', function(req, resp) {
    if (req.session.username) {
        if (req.session.role === 'coordinator') {
            if (req.body.screened) {
                var screened = true;
            } else {
                var screened = false;
            }

            if (req.body.verified) {
                var verified = true;
            } else {
                var verified = false;
            }

            var queryString = 'UPDATE coord_postings SET title = $1, school = $2, type = $3, on_what_day = $4, num_of_interpreter = $5, num_of_transcriber = $6, course_number = $7, time = $8, verified = $9, screened = $10, detail = $11 WHERE post_id = $12';
            pool.query(queryString, [req.body.title, req.body.school, req.body.type, req.body.when, req.body.num_of_interpreter, req.body.num_of_transcriber, req.body.course_number, req.body.time, verified, screened, req.body.details, req.body.post_id], function(err, result) {
                if (err) {
                    console.log(err);
                    resp.send({status: 'fail'});
                } else if (result !== undefined && result.rowCount > 0) {
                    resp.send({status: 'success'});
                }
            });
        } else if (req.session.role === 'ti') {
            var daysAvailable = req.body.days.join(', ');
            var queryString = 'UPDATE ti_postings SET title = $1, time_available = $2, starting = $3, recurring = $4, days_available = $5, details = $6 WHERE post_id = $7';
            pool.query(queryString, [req.body.title, req.body.time, req.body.starting, req.body.recurring, daysAvailable, req.body.details, req.body.post_id], function(err, result) {
                if (err) {
                    console.log(err);
                    resp.send({status: 'fail'});
                } else if (result !== undefined && result.rowCount > 0) {
                    resp.send({status: 'success'});
                }
            });
        }
    }
});

app.post('/apply', function(req, resp) {
    if (req.session.username) {
        pool.query('INSERT INTO applicants (user_id, post_id, comments) VALUES($1, $2, $3) RETURNING post_id', [req.body.user_id, req.body.post_id, req.body.comment], function(err, result) {
            if (err) { console.log(err); }

            if (result !== undefined && result.rowCount > 0) {
                resp.redirect('/posting-details?post_id=' + result.rows[0].post_id + '&role=coordinator');
            }
        });
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.post('/accept-applicant', function(req, resp) {
    if (req.session.username) {
        pool.query('UPDATE applicants SET accepted = true WHERE application_id = $1', [req.body.application_id], function(err, result) {
            if (err) {
                console.log(err);
                resp.send({status: 'fail'});
            } else if (result !== undefined && result.rowCount > 0) {
                resp.send({status: 'success'});
            }
        });
    }
});

app.post('/activate-post', function(req, resp) {
    if (req.session.username) {
        if (req.session.role === 'coordinator') {
            var queryString = 'UPDATE coord_postings SET status = true WHERE post_id = $1';
        } else if (req.session.role === 'ti') {
            var queryString = 'UPDATE ti_postings SET status = true WHERE post_id = $1';
        }

        pool.query(queryString, [req.body.post_id], function(err, result) {
            if (err) {
                console.log(err);
                resp.send({status: 'fail'});
            } else if (result !== undefined && result.rowCount > 0) {
                resp.send({status: 'success'});
            }
        });
    }
});

app.post('/deactivate-post', function(req, resp) {
    if (req.session.username) {
        if (req.session.role === 'coordinator') {
            var queryString = 'UPDATE coord_postings SET status = false WHERE post_id = $1';
        } else if (req.session.role === 'ti') {
            var queryString = 'UPDATE ti_postings SET status = false WHERE post_id = $1';
        }

        pool.query(queryString, [req.body.post_id], function(err, result) {
            if (err) {
                console.log(err);
                resp.send({status: 'fail'});
            } else if (result !== undefined && result.rowCount > 0) {
                resp.send({status: 'success'});
            }
        });
    }
});

app.post('/delete-post', function(req, resp) {
    if (req.session.username) {
        if (req.session.role === 'coordinator') {
            var queryString = 'DELETE FROM coord_postings WHERE post_id = $1';
        } else if (req.session.role === 'ti') {
            var queryString = 'DELETE FROM ti_postings WHERE post_id = $1';
        }

        pool.query(queryString, [req.body.post_id], function(err, result) {
            if (err) {
                console.log(err);
                resp.send({status: 'fail'});
            } else if (result !== undefined && result.rowCount > 0) {
                resp.send({status: 'success'});
            }
        });
    }
});

app.get('/logout', function(req, resp) {
    req.session = null;

    resp.redirect('/');
});

// Create
app.post('/new-post', function(req, resp) {
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

        pool.query('INSERT INTO coord_postings (title, school, detail, user_id, type, num_of_interpreter, num_of_transcriber, verified, screened, on_what_day) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [req.body.title, req.body.school, req.body.details, req.session.user_id, req.body.type, req.body.how_many_int, req.body.how_many_tra, isVerified, isScreened, req.body.when, hideEmail, hidePhone], function(err, result) {
            if (err) {
                console.log(err);
                resp.send({status: 'fail'});
            } else if (result !== undefined && result.rowCount > 0) {
                resp.send({status: 'success'});
            }
        });
    } else if (req.session.role === 'ti') {
        var daysAvailable = req.body.days.join(', ');

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
