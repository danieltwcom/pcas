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




// ----------- Regex format --------------------
var usernameRegex = /^[a-zA-Z0-9\-_]{4,20}$/;
var stringRegex = /^[a-zA-Z0-9\-_]{1,15}$/;
var emailRegex = /^[a-zA-Z0-9\._\-]{1,50}@[a-zA-Z0-9_\-]{1,50}(.[a-zA-Z0-9_\-])?.(ca|com|org|net|info|us|cn|co.uk|se)$/;
var passwordRegex = /^[^ \s]{4,15}$/;
// -----------Regex format end -------------------


// Initializing PUG template
app.set('view engine', 'pug');
app.set('views', ['templates', 'templates/inc', 'templates/blocks', 'templates/dev']);

// -----------Register ---------------------------
app.post("/register", function(req, resp) {
	console.log(req.body)
    pool.query( 'INSERT INTO users(username,password,email,first_name,last_name,role,phone_number,email_notification,is_verified,details,other_phone) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',[req.body.username,req.body.pass,req.body.email,req.body.fname,req.body.lname,req.body.job,req.body.phone,1,1,req.body.desp,req.body.otherPhone],(err,res) => {
		console.log(err,res)
		if(err){
			console.log(err)
		} 
		if(res.rowCount == 1){
			console.log('test')
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
				resp.redirect("/postings");
			} else {
				resp.render('blocks/login',{message:"need verfied"})
			}
				
		 
			
		}
	})
});

//-------------Login End ----------------------


//-------------Sessions setup
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

//------------------ Routes
// ------------------Get pages
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

// --------------Server listening --------------
server.listen(port, function (err) {
    if (err) {
        console.log(err);
        return false;
    }
    console.log(port + " is running");
});
// ---------------Test page --------------------
app.get('/test', function(req, resp) {
    resp.render('blocks/test');
});