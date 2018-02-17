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
    resp.render('blocks/login');
});

app.get('/profile', function(req, resp) {
    resp.render('blocks/profile');
});

app.get('/edit-profile', function(req, resp) {
    resp.render('blocks/edit-profile')
});

app.get('/postings', function(req, resp) {
    resp.render('blocks/postings');
});

app.get('/my-applications', function(req, resp) {
    resp.render('blocks/my-applications');
});

app.get('/my-posts', function(req, resp) {
    resp.render('blocks/my-posts');
});

app.get('/posting-details', function(req, resp) {
    resp.render('blocks/posting-details', {user: 'coordinator'})
});

app.get('/register', function(req, resp) {
    resp.render('blocks/register');
});

app.get('/inbox', function(req, resp) {
    resp.render('blocks/inbox');
});

app.get('/message', function(req, resp) {
    resp.render('dev/message');
});

app.get('/create-post', function(req, resp) {
    resp.render('blocks/create-post');
});

// Server listening
server.listen(port, function (err) {
    if (err) {
        console.log(err);
        return false;
    }
    console.log(port + " is running");
});