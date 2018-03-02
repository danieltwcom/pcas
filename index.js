// Require all modules
const express = require("express");
const session = require('cookie-session');
const dotenv = require('dotenv').config();
const bodyParser = require("body-parser");
const path = require("path");
const pg = require("pg");

// Server variables setup
const port = process.env.SERVER_PORT || 56789;
var app = express();
const server = require("http").createServer(app);
var pF = path.resolve(__dirname, "html");

// PostgrSQL connection
var pool = new pg.Pool({
    user: process.env.PGSQL_USER,
    host: process.env.PGSQL_HOST,
    password: process.env.PGSQL_PASSWORD,
    database: process.env.PGSQL_DATABASE,
    max: process.env.PGSQL_MAX,
    port: process.env.DB_PORT
});

// initialize body parser
app.use(bodyParser.urlencoded({
    extended: true
}));

// Initializing PUG template
app.set('view engine', 'pug');
app.set('views', ['templates', 'templates/inc', 'templates/blocks', 'templates/dev']);

// Sessions setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Route folders
app.use("/style", [express.static("css"), express.static("css/vendor")]);
app.use("/scripts", [express.static("scripts"), express.static("scripts/vendor")]);
app.use("/image", express.static("image"));
app.use("/inc", express.static("inc"));
app.use('/fonts', express.static('fonts'));

// Routes
// Get pages
app.get("/", function (req, resp) {
    if (req.session.username) {
        resp.redirect('/profile');
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
        resp.render('blocks/edit-profile');
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/postings', function(req, resp) {
    if (req.session.username) {
        resp.render('blocks/postings');
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/my-applications', function(req, resp) {
    if (req.session.username) {
        resp.render('blocks/my-applications');
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/my-posts', function(req, resp) {
    if (req.session.username) {
        resp.render('blocks/my-posts');
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/posting-details', function(req, resp) {
    resp.render('blocks/posting-details', {user: 'coordinator'})
});

app.get('/register', function(req, resp) {
    if (req.session.username) {
        resp.render('blocks/register');
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/inbox', function(req, resp) {
    if (req.session.username) {
        resp.render('blocks/inbox');
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/message', function(req, resp) {
    if (req.session.username) {
        resp.render('dev/message');
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/create-post', function(req, resp) {
    if (req.session.username) {
        resp.render('blocks/create-post');
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

// Authentications
app.post('/login', function(req, resp) {
    pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [req.body.username, req.body.password], function(err, result) {
        if (err) {
            console.log(err);
        }

        if (result != undefined && result.rowCount > 0) {
            req.session = result.rows[0];
            resp.redirect('/profile')
        }
    });
});

app.get('/logout', function(req, resp) {
    req.session = null;

    resp.redirect('/');
});

// Create
app.post('/new_post', function(req, resp) {
    console.log(req.body);
});

// Server listening
server.listen(port, function (err) {
    if (err) {
        console.log(err);
        return false;
    }
    console.log(port + " is running");
});