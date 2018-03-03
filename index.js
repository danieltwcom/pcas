// ---------------Require all modules
const express = require("express");
const session = require('cookie-session');
const dotenv = require('dotenv').config();
const bodyParser = require("body-parser");
const path = require("path");
const pg = require("pg");
// ------------Server variables setup
const port = process.env.SERVER_PORT || 56789;
var app = express();
const server = require("http").createServer(app);
var pF = path.resolve(__dirname, "html");

app.use(bodyParser.urlencoded({
    extended:true
}));

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

// ----------- Regex format --------------------
var usernameRegex = /^[a-zA-Z0-9\-_]{4,20}$/;
var stringRegex = /^[a-zA-Z0-9\-_]{1,15}$/;
var emailRegex = /^[a-zA-Z0-9\._\-]{1,50}@[a-zA-Z0-9_\-]{1,50}(.[a-zA-Z0-9_\-])?.(ca|com|org|net|info|us|cn|co.uk|se)$/;
var passwordRegex = /^[^ \s]{4,15}$/;
// -----------Regex format end -------------------


// -----------Register ---------------------------
app.post("/register", function(req, resp) {
	console.log(req.body)
    pool.query( 'INSERT INTO users(username,password,email,first_name,last_name,role,phone_number,email_notification,is_verified,details,other_phone) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',[req.body.username,req.body.pass,req.body.email,req.body.fname,req.body.lname,req.body.job,req.body.phone,1,1,req.body.desp,req.body.otherPhone],(err,res) => {
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
                if (res.rows[0].role === 'coordinator') {
                    resp.render("blocks/coord_postings", {user: req.session});
                } else if (res.rows[0].role === 'ti') {
                    resp.render('blocks/ti_postings', {user: req.session})
                }
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
        if (req.session.role === 'coordinator') {
            resp.render('blocks/coord_postings', {user: req.session});
        } else if (req.session.role === 'ti') {
            resp.render('blocks/ti_postings', {user: req.session});
        }
    } else {
        resp.render('blocks/login');
    }
});

app.get('/profile', function(req, resp) {
    if (req.session.username) {
        resp.render('blocks/profile', {user: req.session});
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
        if (req.session.role === 'coordinator') {
            resp.render('blocks/coord_postings', {user: req.session});
        } else if (req.session.role === 'ti') {
            resp.render('blocks/ti_postings', {user: req.session});
        }
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

app.get('/posting-details', function(req, resp) {
    if (req.session.username) {
        resp.render('blocks/posting-details', {user: req.session});
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/register', function(req, resp) {
    if (req.session.username) {
        if (req.session.role === 'coordinator') {
            resp.render('blocks/coord_postings', {user: req.session});
        } else if (req.session.role == 'ti') {
            resp.render('blocks/ti_postings', {user: req.session});
        }
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
        if (req.session.role === 'coordinator') {
            resp.render('blocks/coord_create-post', {user: req.session});
        } else if (req.session.role === 'ti') {
            resp.render('blocks/ti_create-post', {user: req.session});
        }
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

// Authentications
/* app.post('/login', function(req, resp) {
    pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [req.body.username, req.body.password], function(err, result) {
        if (err) {
            console.log(err);
        }

        if (result != undefined && result.rowCount > 0) {
            req.session = result.rows[0];
            resp.redirect('/profile')
        }
    });
}); */

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

        pool.query('INSERT INTO coord_postings (title, school, detail, user_id, type, num_of_interpreter, num_of_transcriber, certified, screened, on_what_day, hide_email, hide_phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)', [req.body.title, req.body.school, req.body.details, req.session.user_id, req.body.type, req.body.how_many_int, req.body.how_many_tra, isVerified, isScreened, req.body.when, hideEmail, hidePhone], function(err, result) {
            if (err) {
                console.log(err);
                resp.send({status: 'fail'});
            } else {
                resp.send({status: 'success'});
            }
        })
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
