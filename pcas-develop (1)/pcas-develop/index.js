// ---------------Require all modules
const express = require("express");
const session = require('cookie-session');
const dotenv = require('dotenv').config();
const bodyParser = require("body-parser");
const path = require("path");
const pg = require("pg");
const multer = require('multer');
const bcrypt = require('bcrypt');
const randomstring = require('randomstring');
const mailer = require('./js/mailer')

// ------------Server variables setup
const port = process.env.SERVER_PORT || 56789;
var app = express();
const server = require("http").createServer(app);
var pF = path.resolve(__dirname, "html");
const saltRounds = 10;
var hashPass;

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
var stringRegex = /^$|^[a-zA-Z0-9\-_]{1,40}$/;
var emailRegex = /^[a-zA-Z0-9\._\-]{1,50}@[a-zA-Z0-9_\-]{1,50}(.[a-zA-Z0-9_\-])?.(ca|com|org|net|info|us|cn|co.uk|se)$/;
var passwordRegex = /^[^ \s]{4,15}$/;
var numberRegex = /^$|^[0-9]{1,2}$|100/

var phoneRegex = /^$|^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
// -----------Regex format end -------------------//

// -----------Register ---------------------------//
app.post("/register", function(req, resp) {
	console.log(req.body)
    var tocken = randomstring.generate()
    host=req.get('host');
    
    if (stringRegex.test(req.body.username) && stringRegex.test(req.body.fname)&& stringRegex.test(req.body.lname) && passwordRegex.test(req.body.pass) && phoneRegex.test(req.body.phone) && phoneRegex.test(req.body.otherPhone) ){
            req.session.email=req.body.email
            var link="http://"+req.get('host')+"/verify?tc="+tocken+"&email="+req.body.email;
        bcrypt.genSalt(saltRounds,function(err,salt){
            bcrypt.hash(req.body.pass,salt,function(err,hash){
                pool.query( 'INSERT INTO users(username,password,email,first_name,last_name,role,phone_number,email_notification,is_verified,description,other_phone,tocken) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',[req.body.username,hash,req.body.email,req.body.fname,req.body.lname,req.body.job,req.body.phone,1,0,req.body.desp,req.body.otherPhone,tocken],(err,res) => {
                    console.log(err)
                    if(err){
                        resp.send({status:"fail",message:"Input invalid to database"})
                    } 
                    if(res != undefined && res.rowCount == 1){
                        resp.send({status:"success"})
                        
                        mailer.emailVerify({reciver:req.body.email,link:link})
                    }
                });
            });
        });
        
    } else {
        resp.send({status:'fail',message:"Input invalid"})
    }
});

app.post("/duplicate_check",function(req,resp){
    console.log(req.body)
    pool.query('SELECT * from users where username = $1 or email = $1',[req.body.checkValue],(err,res) => {
        if(res != undefined && res.rowCount ==1){
            resp.send({status:"fail"})
        }
        if(res != undefined && res.rowCount ==0){
            resp.send({status:"success"})
        }
    })
})

// ------------Register End -------------------//
//-------------Login --------------------------//
app.post("/login", function(req, resp) {
    console.log(req.body)
    if(stringRegex.test(req.body.username) && passwordRegex.test(req.body.password)){
    	pool.query('SELECT * FROM users WHERE username = $1 or email = $1',[req.body.username],(err,res) => {
    		if (res != undefined && res.rows.length > 0){
                bcrypt.compare(req.body.password,res.rows[0].password,function(err,resc){
                    if(resc){
                        if(res.rows[0].is_verified == 1){
                            req.session = res.rows[0];
                            console.log(req.session);
                            resp.redirect('/postings');
                        } else {
                            req.session.email=res.rows[0].email
                            resp.render('blocks/login',{message:"Your account is not verified", verify:"Click here to verify your account "})
                        }
                    } else {
                        resp.render('blocks/login',{message:"Wrong password"})
                    }
                })
    			
    		} else {
                resp.render('blocks/login',{message:"Account does not exist"})
            }
    	})
    } else {
        resp.render('blocks/login',{message:"Wrong username or password"})
    }

});
//-------------Login End ----------------------//

//-------------Email Verify ------------------//

app.get("/verify",function(req,resp){

    if(emailRegex.test(req.query.email) == false || stringRegex.test(req.query.tc) == false){
        resp.render('blocks/login')
        return
    }


    pool.query('Select * from users where email = $1',[req.query.email],(err,res) => {
        var tocken;

        if(res != undefined && res.rowCount==1){

            tocken = res.rows[0].tocken

        }
        if(tocken==req.query.tc){
            pool.query("Update users set is_verified = true where email = $1",[req.query.email],(err,res) => {
                if(err){
                    console.log(err)
                    resp.render('blocks/verify',{message:'Unable to verify account'})
                } else {
                    resp.render('blocks/login',{message:'Verify success. Thank you! Now you may login'})
                }
            })
        } else {
             resp.render('blocks/verify', {message:'Varificaion fail'})
        }
        if(res == undefined | res.rowCount==0){
            resp.render('blocks/verify',{message:"Account does not exist"})
        }


    })

})
//-------------Email Verify End --------------//

//-------------Forget Password----------------
app.post("/forgetPass",function(req,resp){
    console.log(req.body)
    if(emailRegex.test(req.body.email)){
       pool.query('SELECT * FROM users WHERE email = $1',[req.body.email],(err,res) => {
            if (res != undefined && res.rows.length > 0){
                var tocken = randomstring.generate()
                console.log(tocken)
                var link="http://"+req.get('host')+"/resetPass?tc="+tocken+"&email="+req.body.email;
                pool.query('UPDATE users SET tocken=$1 where email=$2',[tocken,req.body.email],(err,res) => {
                    if(err){
                        console.log(err)
                    }
                })

                mailer.emailForgetPass({reciver:req.body.email,link:link})
                resp.render("blocks/pleaseVerify")
            } else {
                resp.render("blocks/forget-pass",{message:'account dost not exit'})
            }
    
        })
    } else {
        resp.render("blocks/forget-pass",{message:'account dost not exit'})
    }
    
})

app.get("/resetPass",function(req,resp){

    if(emailRegex.test(req.query.email) == false || stringRegex.test(req.query.tc) == false){
        resp.render('blocks/login')
        return
    }

    pool.query('Select * from users where email = $1',[req.query.email],(err,res) => {
        var tocken;
        var date = new Date();
        // check account exist
        console.log(req.query.email)
        console.log(res.rows[0])
        if(res != undefined && res.rowCount==1){

            tocken = res.rows[0].tocken

        }
        // check tocken expired date
        if(date > res.rows[0].toc_expire){
            resp.render('blocks/forget-pass',{message:'Link expired'})
            return 
        }
        // verify tocken
        if(tocken==req.query.tc){
            req.session.email = req.query.email
            resp.render('blocks/reset-pass')
        } else {
             resp.render('blocks/forget-pass', {message:'Link expired'})
        }
        if(res == undefined | res.rowCount==0){
            resp.render('blocks/forget-pass',{message:"Account does not exist"})
        }


    })
})

app.post("/resetPass",function(req,resp){
    console.log(req.body)
    if(req.body.password != req.body.rePassword){
        resp.render('blocks/reset-pass', {message:"Input doesn't match"})
    }


    if(passwordRegex.test(req.body.password)){
       bcrypt.genSalt(saltRounds,function(err,salt){
            bcrypt.hash(req.body.password,salt,function(err,hash){
                pool.query( 'UPDATE users SET password = $1  where email = $2',[hash,req.session.email],(err,res) => {
                    console.log(err)
                    if(err){
                        resp.send({status:"fail",message:"Input invalid to database"})
                    } 
                    if(res != undefined && res.rowCount == 1){
                        pool.query('UPDATE users SET tocken = null where email = $1',[req.session.email],(err,res) => {
                            if (err){
                                console.log(err)
                            }
                        })
                        resp.render('blocks/login', {message:'Reset password succes, now you may login'}) 
                       
                    }
                });
            });
        });
    }
})

//---------------User profile ---------------//



app.post("/edit-profile",function(req,resp){
    console.log(req.body)
    if((stringRegex.test(req.body.first_name) && stringRegex.test(req.body.last_name) && stringRegex.test(req.body.location) && phoneRegex.test(req.body.phone) && phoneRegex.test(req.body.other_phone) && numberRegex.test(req.body.age) && stringRegex.test(req.body.gender) )== false ){
        resp.render('blocks/edit-profile')
        return
    }
    pool.query("UPDATE users SET first_name=$1 last_name=$2 location=$3 phone_number = $4 other_phone = $5 age = $6 gender = $7 description = $8",[req.body.first_name,req.body.last_name,req.body.location,req.body.phone,req.body.other_phone,req.body.age,req.body.gender,req.body.description],(err,res) => {
        if (err){
            console.log(err)
            
        }
    })

})



//------------------ Routes --------------- //
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

            var profile = result.rows[0];

            if (result !== undefined && result.rows.length > 0) {
                pool.query('SELECT * FROM upvotes', function(err, result) {
                    if (err) { console.log(err); }
                    resp.render('blocks/profile', {user: profile, upvotes: result.rows});
                });
            }
        });
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
        pool.query("SELECT * FROM coord_postings JOIN users ON coord_postings.user_id = users.user_id WHERE status = true AND progress NOT IN ('In Progress', 'Complete') ORDER BY coord_postings.date_created ASC", function(err, c_result) {
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
        pool.query('SELECT * FROM applicants JOIN coord_postings ON applicants.post_id = coord_postings.post_id JOIN users ON users.user_id = coord_postings.user_id WHERE applicants.applicant_id = $1 ORDER BY applicants.post_id', [req.session.user_id], function(err, result) {
            if (err) {
                console.log(err);
                resp.send({status: 'fail'});
            } else if (result !== undefined && result.rows.length > 0) {
                resp.render('blocks/my-applications', {user: req.session, applications: result.rows});
            }
        });
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
    
                    pool.query('SELECT * FROM applicants JOIN users ON users.user_id = applicants.applicant_id WHERE applicants.post_id = $1 ORDER BY users.username', [postId], function(err, result) {
                        if (err) { console.log(err); }
        
                        if (result !== undefined) {
                            var applicantsList = result.rows;
            
                            pool.query('SELECT * FROM upvotes', function(err, result) {
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

app.get('/forgetPass',function(req,resp){
    resp.render('blocks/forget-pass')
})

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

        if (result !== undefined && result.rows.length > 0) {
            resp.send(result.rows);
        }
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
        pool.query('INSERT INTO applicants (applicant_id, post_id, comments) VALUES($1, $2, $3) RETURNING post_id', [req.body.user_id, req.body.post_id, req.body.comment], function(err, result) {
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
        pool.query('SELECT num_of_interpreter, num_of_transcriber FROM coord_postings WHERE post_id = $1', [req.body.post_id], function(err, result) {
            if (err) { console.log(err); }

            var neededApplicants = parseInt(result.rows[0].num_of_interpreter) + parseInt(result.rows[0].num_of_transcriber);
            console.log(neededApplicants);
            var countQuery = 'SELECT COUNT(*) as accepted FROM applicants WHERE accepted = true AND post_id = $1';
            
            pool.query(countQuery, [req.body.post_id], function(err, result) {
                if (err) {console.log(err); }
                console.log(result.rows);

                if (result !== undefined && result.rows[0].accepted < neededApplicants) {
                    pool.query('UPDATE applicants SET accepted = true WHERE application_id = $1', [req.body.application_id], function(err, result) {
                        if (err) {
                            console.log(err);
                            resp.send({status: 'fail'});
                        } else if (result !== undefined && result.rowCount > 0) {
                            pool.query(countQuery, [req.body.post_id], function(err, result) {
                                console.log(result.rows);
                                if (result !== undefined && parseInt(result.rows[0].accepted) === neededApplicants) {
                                    console.log('true');
                                    pool.query("UPDATE coord_postings SET progress = 'In Progress' WHERE post_id = $1", [req.body.post_id], function(err, result) {
                                        if (err) { console.log(err); }

                                        console.log(result);
                                    });
                                }
                            });

                            resp.send({status: 'success'});
                        }
                    });
                } else {
                    resp.send({status: 'exceeded'});
                }
            })
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

app.post('/application/:status', function(req, resp) {
    if (req.session.username) {
        if (req.params.status === 'withdraw') {
            pool.query('DELETE FROM applicants WHERE application_id = $1 RETURNING application_id', [req.body.id], function(err, result) {
                if (err) {
                    console.log(err);
                    resp.send({status: 'fail'});
                } else if (result !== undefined && result.rowCount > 0) {
                    resp.send({status: 'success', id: result.rows[0].application_id});
                }
            });
        } else if (req.params.status === 'complete') {
            pool.query('SELECT progress FROM coord_postings WHERE post_id = $1', [req.body.post_id], function(err, result) {
                if (err) { console.log(err); }

                if (result !== undefined) {
                    if (result.rows[0].progress === 'In Progress') {
                        pool.query('UPDATE applicants SET is_complete = true WHERE application_id = $1', [req.body.id], function(err, result) {
                            if (err) {
                                console.log(err);
                                resp.send({status: 'fail'});
                            } else if (result !== undefined && result.rowCount > 0) {
                                resp.send({status: 'success'});
                            }
                        });
                    } else if (result.rows[0].progress === 'Open') {
                        resp.send({status: 'unavailable'});
                    }
                }
            });
        } else if (req.params.status === 'upvote') {
            console.log(req.body);
            pool.query('SELECT * FROM applicants WHERE application_id = $1', [req.body.id], function(err, result) {
                if (err) { console.log(err); }

                if (result !== undefined && result.rows.length > 0) {
                    if (req.session.role === 'coordinator') {
                        if (result.rows[0].is_complete === true && result.rows[0].ti_upvoted === false) {
                            pool.query('UPDATE applicants SET ti_upvoted = true WHERE application_id = $1', [result.rows[0].application_id], function(err, result) {
                                if (err) { console.log(err); }

                                pool.query('INSERT INTO upvotes (voter_id, voted_user_id) VALUES ($1, $2)', [req.body.voter_id, req.body.voted_user_id], function(err, result) {
                                    if (err) { console.log(err); }

                                    resp.send({status: 'success'});
                                })
                            })
                        } else if (result.rows[0].is_complete === true && result.rows[0].ti_upvoted === true) {
                            resp.send({status: 'voted'});
                        } else if (result.rows[0].is_complete === false) {
                            resp.send({status: 'incomplete'});
                        }
                    } else if (req.session.role === 'ti') {
                        console.log(result.rows);
                        if (result.rows[0].is_complete === true && result.rows[0].coord_upvoted === false) {
                            pool.query('UPDATE applicants SET coord_upvoted = true WHERE application_id = $1', [result.rows[0].application_id], function(err, result) {
                                if (err) { console.log(err); }

                                pool.query('INSERT INTO upvotes (voter_id, voted_user_id) VALUES ($1, $2)', [req.body.voter_id, req.body.voted_user_id], function(err, result) {
                                    if (err) { console.log(err); }

                                    resp.send({status: 'success'});
                                })
                            })
                        } else if (result.rows[0].is_complete === true && result.rows[0].coord_upvoted_upvoted === true) {
                            resp.send({status: 'voted'});
                        } else if (result.rows[0].is_complete === false) {
                            resp.send({status: 'incomplete'});
                        }
                    }
                }
            });
        }
    }
});

app.post('/revoke-applicant', function(req, resp) {
    if (req.session.username) {
        pool.query('UPDATE applicants SET accepted = false WHERE application_id = $1', [req.body.application_id], function(err, result) {
            if (err) {
                console.log(err);
                resp.send({status: 'fail'});
            } else if (result !== undefined && result.rowCount > 0) {
                resp.send({status: 'success'});
            }
        });
    }
});

app.post('/job/complete', function(req, resp) {
    if (req.session.username) {
        if (req.session.role === 'coordinator') {
            pool.query("UPDATE coord_postings SET progress = 'Complete' WHERE post_id = $1", [req.body.post_id], function(err, result) {
                if (err) {
                    console.log(err);
                    resp.send({status: 'fail'});
                } else if (result !== undefined && result.rowCount > 0) {
                    pool.query('UPDATE applicants SET is_complete = true WHERE post_id = $1', [req.body.post_id], function(err, result) {
                        if (err) {
                            console.log(err);
                            resp.send('fail');
                        } else if (result !== undefined && result.rowCount > 0) {
                            resp.send({status: 'success'});
                        }
                    });
                }
            });
        }
    }
});

app.get('/logout', function(req, resp) {
    req.session = null;

    resp.redirect('/');
});

app.get('/pleaseVerify',function(req,resp){
    if(req.session.email){
        resp.render('blocks/pleaseVerify')
    } else {
        resp.render('blocks/login')
    }

})

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


//----------------Functions -------------------//

//----------------Generate Tocken ------------//

app.get("/test", function (req, resp) {
    
    resp.render('blocks/pleaseVerify');
});