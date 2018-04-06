// ---------------Require all modules
const express = require("express");
const session = require('cookie-session');
const dotenv = require('dotenv').config();
const bodyParser = require("body-parser");
const path = require("path");
const pg = require("pg");
const multer = require('multer');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const randomstring = require('randomstring');
const mailer = require('./js/mailer');
const fs = require('fs');

// ------------Server variables setup
const port = process.env.PORT;
var app = express();
const server = require("http").createServer(app);
var pF = path.resolve(__dirname, "html");
const saltRounds = 10;
var hashPass;

//----------------PostgrSQL connection---------------
if (process.env.NODE_ENV === 'production') {
    pg.defaults.size = 20;
    var pool = new pg.Client(process.env.DATABASE_URL);
    pool.connect();
} else {
    var pool = new pg.Pool({
        user: process.env.PGSQL_USER,
        host: process.env.DATABASE_URL,
        password:process.env.PGSQL_PASSWORD,
        database: process.env.PGSQL_DATABASE,
        max:process.env.PGSQL_MAX,
        port: process.env.DB_PORT
    });
}

// initialize body parser
app.use(bodyParser.urlencoded({
    extended: true
}));

// multer storage configuration
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        let dir = 'users-file/' + req.session.user_id;
        let profileDir = dir + '/profile-pic';

        if (fs.existsSync(dir)) {
            cb(null, profileDir);
        } else {
            return cb(new Error('DIR_NOT_EXIST'));
        }
    },
    filename: function(req, file, cb) {
        let filename = randomstring.generate();
        let extension = file.originalname.split('.').pop();
        cb(null, filename + '.' + extension);
    }
});

var upload = multer({
    storage: storage,
    limits: {
        fileSize: 2000000
    },
    fileFilter: function(req, file, cb) {
        let extension = path.extname(file.originalname);
        let extRegex = /\.(jpg|jpeg|png|gif)$/

        if (extRegex.test(extension) === false) {
            let error = new Error('Wrong file type');
            error.code = 'INVALID_FILE_TYPE';
            return cb(error);
        } else {
            let filesize = parseInt(req.headers['content-length']);
            let dir = 'users-file/' + req.session.user_id;
            let profileDir = dir + '/profile-pic';

            if (filesize < 2000000) {
                if (fs.existsSync(dir)) {
                    if (fs.existsSync(profileDir)) {
                        fs.readdir(profileDir, (err, files) => {
                            if (err) { console.log(err); }
        
                            for (let file of files) {
                                fs.unlinkSync(path.join(profileDir, file), err => {
                                    if (err) { console.log(err); }
                                });
                            }
                        });
                    } else {
                        fs.mkdir(profileDir);
                    }
                } else {
                    fs.mkdir(dir);
                    fs.mkdir(profileDir);
                }
            } else {
                let error = new Error('File too big');
                error.code = 'LIMIT_FILE_SIZE';
                return cb(error);
            }
        }

        cb(null, true);
    }
});

var documentStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        let dir = 'users-file/' + req.session.user_id;
        let documentDir = dir + '/documents';

        if (fs.existsSync(dir)) {
            cb(null, documentDir);
        } else {
            return cb(new Error('DIR_NOT_EXIST'));
        }
    },
    filename: function(req, file, cb) {
        let filename = randomstring.generate();
        let extension = file.originalname.split('.').pop();
        cb(null, filename + '.' + extension);
    }
});

var documentUpload = multer({
    storage: documentStorage,
    limits: {
        fileSize: 2000000
    },
    fileFilter: function(req, file, cb) {
        let extension = path.extname(file.originalname);
        let extRegex = /\.(jpg|jpeg|png|gif|pdf|doc)$/

        if (extRegex.test(extension) === false) {
            let error = new Error('Wrong file type');
            error.code = 'INVALID_FILE_TYPE';
            return cb(error);
        } else {
            let filesize = parseInt(req.headers['content-length']);
            let dir = 'users-file/' + req.session.user_id;
            let profileDir = dir + '/documents';

            if (filesize < 2000000) {
                if (fs.existsSync(dir)) {
                    if (!fs.existsSync(profileDir)) {
                        fs.mkdir(profileDir);
                    }
                } else {
                    fs.mkdir(dir);
                    fs.mkdir(profileDir);
                }
            } else {
                let error = new Error('File too big');
                error.code = 'LIMIT_FILE_SIZE';
                return cb(error);
            }
        }

        cb(null, true);
    }
});

//-------------Sessions setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    maxAge: 24 * 60 * 60 * 1000 // 10 minutes
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

    if (req.body.agree) {
        if (stringRegex.test(req.body.username) && stringRegex.test(req.body.fname)&& stringRegex.test(req.body.lname) && passwordRegex.test(req.body.pass) && phoneRegex.test(req.body.phone) && phoneRegex.test(req.body.otherPhone) ){
            req.session.email=req.body.email
            var link="http://"+req.get('host')+"/verify?tc="+tocken+"&email="+req.body.email;
            bcrypt.genSalt(saltRounds,function(err,salt){
                bcrypt.hash(req.body.pass,salt,function(err,hash){
                    pool.query( 'INSERT INTO users(username,password,email,first_name,last_name,role,phone_number,email_notification,is_verified,description,other_phone,tocken,location) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',[req.body.username,hash,req.body.email,req.body.fname,req.body.lname,req.body.job,req.body.phone,1,0,req.body.desp,req.body.otherPhone,tocken,req.body.school],(err,res) => {
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
    } else {
        resp.send({status: 'disagree'});
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
                pool.query('SELECT * FROM users WHERE user_id = $1 AND suspended = false', [res.rows[0].user_id], function(err, result) {
                    if (err) { console.log(err); }

                    if (result !== undefined && result.rows.length > 0) {
                        bcrypt.compare(req.body.password,res.rows[0].password,function(err,resc){
                            if(resc){
                                if(res.rows[0].is_verified == 1){
                                    pool.query('UPDATE users SET last_login = current_timestamp WHERE user_id = $1', [res.rows[0].user_id]);
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
                        resp.render('blocks/login', {message: 'Your account has been suspended'});
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
                    resp.render('blocks/login',{message:'Verification successful'})
                }
            })
        } else {
             resp.render('blocks/verify', {message:'Verificaion fail'})
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
        resp.send({status:"fail",message:"Input invalid"})
        return
    }
    pool.query("UPDATE users SET first_name=$1 last_name=$2 location=$3 phone_number = $4 other_phone = $5 age = $6 gender = $7 description = $8",[req.body.first_name,req.body.last_name,req.body.location,req.body.phone,req.body.other_phone,req.body.age,req.body.gender,req.body.description],(err,res) => {
        if (err){
            console.log(err)
            resp.send({status:"fail",message:"Update fail "})
        }
        if(res != undefined && res.rowCount ==1){
            resp.send({status:"success",message:"Update success"})
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
        var message = '';

        if (req.query.error === 'invalid') {
            var message = 'invalid';
        } else if (req.query.error === 'big') {
            var message = 'big';
        }

        pool.query('SELECT * FROM users WHERE user_id = $1', [userId], function(err, result) {
            if (err) { console.log(err); }

            var profile = result.rows[0];

            if (result !== undefined && result.rows.length > 0) {
                pool.query('SELECT * FROM documents WHERE owner_id = $1', [userId], function(err, result) {
                    if (err) { console.log(err); }

                    if (result !== undefined) {
                        var documents = result.rows;
                    }

                    pool.query('SELECT * FROM upvotes', function(err, result) {
                        if (err) { console.log(err); }
                        resp.render('blocks/profile', {user: req.session, viewing: profile, upvotes: result.rows, documents: documents, message: message});
                    });
                });
            }
        });
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/faq', function(req, resp) {
    if (req.session.username) {
        resp.render('blocks/faq', {user: req.session});
    } else {
        resp.render('blocks/faq');
    }
});

app.get('/tos', function(req, resp) {
    if (req.session.username) {
        resp.render('blocks/tos', {user: req.session});
    } else {
        resp.render('blocks/tos');
    } 
});

app.get('/documents/:userid/:filename', function(req, resp) {
    if (req.session.username) {
        resp.sendFile(__dirname + '/users-file/' + req.params.userid + '/documents/' + req.params.filename);
    }
});

app.get('/edit-profile', function(req, resp) {
    if (req.session.username) {
        var message = '';

        if (req.query.error === 'invalid') {
            var message = 'invalid';
        } else if (req.query.error === 'big') {
            var message = 'big';
        }

        pool.query('SELECT * FROM documents WHERE owner_id = $1', [req.session.user_id], function(err, result) {
            if (err) { console.log(err); }

            if (result !== undefined) {
                resp.render('blocks/edit-profile', {user: req.session, documents: result.rows, message: message});
            }
        });
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/postings', function(req, resp) {
    if (req.session.username) {
        pool.query("SELECT * FROM coord_postings JOIN users ON coord_postings.user_id = users.user_id WHERE is_hidden = false AND progress NOT IN ('Complete') AND is_archived = false ORDER BY coord_postings.date_created DESC", function(err, result) {
            if (err) { console.log(err); }

            if (result !== undefined) {
                var coord_postings = result.rows;
            }

            pool.query('SELECT * FROM ti_postings JOIN users ON ti_postings.user_id = users.user_id WHERE is_hidden = false AND is_archived = false ORDER BY ti_postings.date_created DESC', function(err, result) {
                if (err) { console.log(err); }

                if (result !== undefined) {
                    var ti_postings = result.rows;
                }

                resp.render('postings', {user: req.session, coord_postings: coord_postings, ti_postings: ti_postings});
            });
        });
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/my-applications', function(req, resp) {
    if (req.session.username) {
        if (req.session.role !== 'admin') {
            pool.query('SELECT * FROM applicants JOIN coord_postings ON applicants.post_id = coord_postings.post_id JOIN users ON users.user_id = coord_postings.user_id WHERE applicants.applicant_id = $1 ORDER BY applicants.post_id', [req.session.user_id], function(err, result) {
                if (err) {
                    console.log(err);
                    resp.send({status: 'fail'});
                } else if (result !== undefined) {
                    resp.render('blocks/my-applications', {user: req.session, applications: result.rows});
                }
            });
        } else {
            resp.render('blocks/404', {user: req.session, message: '404'});
        }
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/my-posts', function(req, resp) {
    if (req.session.username) {
        if (req.session.role !== 'admin') {
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
            resp.render('blocks/404', {user: req.session, message: '404'});
        }
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
                    console.log(coordPosting);
    
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
});

app.get('/inbox', function(req, resp) {
    if (req.session.username) {
        pool.query('SELECT * FROM messages JOIN users ON messages.sender = users.username WHERE recipient = $1 ORDER BY messages.date_created DESC', [req.session.username], function(err, result) {
            if (err) { console.log(err); }

            if (result !== undefined) {
                resp.render('blocks/inbox', {user: req.session, inbox: result.rows});
            }
        });
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/outbox', function(req, resp) {
    if (req.session.username) {
        pool.query('SELECT * FROM messages JOIN users ON messages.recipient = users.username WHERE sender = $1 ORDER BY messages.date_created DESC', [req.session.username], function(err, result) {
            if (err) { console.log(err); }

            resp.render('blocks/outbox', {user: req.session, outbox: result.rows});
        });
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.post('/get-message-count', function(req, resp) {
    if (req.session.username) {
        pool.query('SELECT COUNT(*) as message_count FROM messages WHERE recipient = $1 AND is_read = false', [req.body.username], function(err, result) {
            if (err) { console.log(err); }

            if (result !== undefined) {
                resp.send({message_count: result.rows[0].message_count});
            }
        });
    }
});

app.post('/get-upvotes', function(req, resp) {
    if (req.session.username) {
        pool.query('SELECT COUNT(*) AS upvotes FROM upvotes WHERE voted_user_id = $1', [req.session.user_id], function(err, result) {
            if (err) { console.log(err); }

            if (result !== undefined) {
                resp.send({upvotes: result.rows[0].upvotes});
            }
        });
    }
});

app.get('/compose', function(req, resp) {
    if (req.session.username) {
        var recipient = '';

        if (req.query.recipient) {
            var recipient = req.query.recipient;
        }

        if (req.query.id) {
            pool.query('SELECT * FROM messages WHERE message_id = $1 AND sender = $2 AND recipient = $3', [req.query.id, recipient, req.session.username], function(err, result) {
                if (err) { console.log(err); }

                if (result !== undefined && result.rows.length > 0) {
                    resp.render('blocks/compose', {user: req.session, recipient: recipient, message: result.rows[0]});
                } else if (result !== undefined && result.rows.length === 0) {
                    resp.render('blocks/404', {user: req.session, message: '404'});
                }
            })
        } else {
            resp.render('blocks/compose', {user: req.session, recipient: recipient});
        }
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/message-details', function(req, resp) {
    if (req.session.username) {
        console.log(req.query.id);
        pool.query('UPDATE messages SET is_read = true WHERE message_id = $1 AND (sender = $2 OR recipient = $3)', [req.query.id, req.session.username, req.session.username], function(err, result) {
            if (err) { console.log(err); }

            pool.query('SELECT * FROM messages WHERE message_id = $1 AND (sender = $2 OR recipient = $3) ORDER BY date_created DESC', [req.query.id, req.session.username, req.session.username], function(err, result) {
                if (err) {
                    console.log(err);
                } else if (result !== undefined && result.rows.length > 0) {
                    console.log(result.rows);
                    resp.render('blocks/message-details', {user: req.session, message: result.rows[0]});
                } else if (result !== undefined && result.rows.length === 0) {
                    resp.render('blocks/404', {user: req.session, message: '404'});
                }
            });
        });
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
}); 

app.get('/sent', function(req, resp) {
    if (req.session.username) {
        resp.render('blocks/message-action', {user: req.session, message: 'Message has been sent'});
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
}); 

app.post('/send-message', function(req, resp) {
    if (req.session.username) {
        pool.query('INSERT INTO messages (sender, subject, message, recipient) VALUES ($1, $2, $3, $4)', [req.body.sender, req.body.subject, req.body.message, req.body.recipient], function(err, result) {
            if (err) {
                console.log(err);
                resp.send({status: 'fail'});
            } if (result !== undefined && result.rowCount > 0) {
                resp.send({status: 'success'});
            }
        });
    }
});

app.get('/create-post', function(req, resp) {
    console.log(req.session);
    if (req.session.username) {
        if (req.session.role !== 'admin') {
            resp.render('blocks/create-post', {user: req.session});
        } else {
            resp.render('blocks/404', {user: req.session, message: '404'});
        }
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

app.get('/edit-post', function(req, resp) {
    if (req.session.username) {
        if (req.session.role !== 'admin') {
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
            });
        } else {
            resp.render('blocks/404', {user: req.session, message: '404'});
        }
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

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

app.post('/upload-profile-pic', function(req, resp) {
    let uploadProfilePic = upload.single('profile_pic');

    uploadProfilePic(req, resp, function(err) {
        if (err) {
            console.log(err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                resp.redirect('/profile?user_id=' + req.session.user_id + '&error=big');
            } else if (err.code = 'INVALID_FILE_TYPE') {
                console.log(err.code);
                resp.redirect('/profile?user_id=' + req.session.user_id + '&error=invalid');
            }
        }

        if (req.file !== undefined) {
            if (req.file.mimetype === 'image/png' || req.file.mimetype === 'image/gif' || req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/jpg') {
                let avatarUrl = '/files/' + req.session.user_id + '/profile-pic/' + req.file.filename;
    
                pool.query('UPDATE users SET avatar_url = $1 WHERE user_id = $2 RETURNING avatar_url', [avatarUrl, req.session.user_id], function(err, result) {
                    if (err) { console.log(err); }
                    
                    req.session.avatar_url = result.rows[0].avatar_url;
                    resp.redirect('/profile?user_id=' + req.session.user_id);
                })
            } else {
                resp.redirect('/profile?user_id=' + req.session.user_id + '&error=invalid');
            }
        }
    });
});

app.post('/upload-document', function(req, resp) {
    let uploadDocument = documentUpload.single('document');

    uploadDocument(req, resp, function(err) {
        if (err) {
            console.log(err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                resp.redirect('/edit-profile?error=big#documents');
            } else if (err.code === 'INVALID_FILE_TYPE') {
                resp.redirect('/edit-profile?error=invalid#documents');
            }
        }

        if (req.file !== undefined) {
            if (req.file.mimetype === 'application/pdf' || req.file.mimetype === 'image/gif' || req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/jpg' || req.file.mimetype === 'application/msword' || req.file.mimetype === 'image/png') {
                let documentUrl = '/files/' + req.session.user_id + '/documents/' + req.file.filename;

                pool.query('INSERT INTO documents (url, owner_id, title) VALUES ($1, $2, $3)', [documentUrl, req.session.user_id, req.body.title], function(err, result) {
                    if (err) { console.log(err); }
                    
                    if (result !== undefined && result.rowCount > 0) {
                        resp.redirect('/edit-profile#documents');
                    }
                });
            }
        }
    });
});

app.post('/delete-document', function(req, resp) {
    if (req.session.username) {
        pool.query('DELETE FROM documents WHERE id = $1 RETURNING *', [req.body.id], function(err, result) {
            if (err) {
                resp.send({status: 'fail'});
            } else if (result !== undefined && result.rowCount > 0) {
                let filePathSplit = result.rows[0].url.split('/');
                let file = '/users-file/' + filePathSplit[2] + '/' + filePathSplit[3] + '/' + filePathSplit[4];
                fs.unlink(__dirname + file, function(err) {
                    resp.send({status: 'successs', id: result.rows[0].id});
                });
            }
        });
    }
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
        if (req.session.role === 'coordinator' || (req.session.role === 'admin' && req.body.post_type=="coord")) {
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
                    resp.send({status: 'success',role:req.session.role});
                }
            });
        } else if (req.session.role === 'ti' || (req.session.role === 'admin' && req.body.post_type=="ti")) {
            var daysAvailable = req.body.days.join(', ');
            var queryString = 'UPDATE ti_postings SET title = $1, time_available = $2, starting = $3, recurring = $4, days_available = $5, details = $6 WHERE post_id = $7';
            pool.query(queryString, [req.body.title, req.body.time, req.body.starting, req.body.recurring, daysAvailable, req.body.details, req.body.post_id], function(err, result) {
                if (err) {
                    console.log(err);
                    resp.send({status: 'fail'});
                } else if (result !== undefined && result.rowCount > 0) {
                    resp.send({status: 'success',role:req.session.role});
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
                                    pool.query("UPDATE coord_postings SET progress = 'Fulfilled' WHERE post_id = $1", [req.body.post_id], function(err, result) {
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
            var queryString = 'UPDATE coord_postings SET is_hidden = false WHERE post_id = $1';
        } else if (req.session.role === 'ti') {
            var queryString = 'UPDATE ti_postings SET is_hidden = false WHERE post_id = $1';
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
            var queryString = 'UPDATE coord_postings SET is_hidden = true WHERE post_id = $1';
        } else if (req.session.role === 'ti') {
            var queryString = 'UPDATE ti_postings SET is_hidden = true WHERE post_id = $1';
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

app.post('/archive-post', function(req, resp) {
    console.log(req.body);
    if (req.session.username) {
        if (req.session.role === 'coordinator') {
            var queryString = 'UPDATE coord_postings SET is_archived = true WHERE post_id = $1 RETURNING post_id';
        } else if (req.session.role === 'ti') {
            var queryString = 'UPDATE ti_postings SET is_archived = true WHERE post_id = $1 RETURNING post_id';
        }

        pool.query(queryString, [req.body.post_id], function(err, result) {
            if (err) {
                console.log(err);
                resp.send({status: 'fail'});
            } else if (result !== undefined && result.rowCount > 0) {
                resp.send({status: 'success', id: result.rows[0].post_id});
            }
        });
    }
});

app.post('/change-progress', function(req, resp) {
    if (req.session.username) {
        if (req.body.progress !== 'Open') {
            pool.query('SELECT * FROM applicants WHERE post_id = $1 AND accepted = true', [req.body.post_id], function(err, result) {
                if (err) {
                    console.log(err);
                    resp.send({status: 'fail'});
                } else if (result !== undefined) {
                    if (result.rows.length === 0) {
                        resp.send({status: 'empty'});
                    } else {
                        if (req.body.progress === 'Complete') {
                            pool.query('UPDATE applicants SET is_complete = true WHERE post_id = $1', [req.body.post_id]);
                        } else {
                            pool.query('UPDATE applicants SET is_complete = false WHERE post_id = $1', [req.body.post_id]);
                        }

                        pool.query('UPDATE coord_postings SET progress = $1 WHERE post_id = $2 RETURNING post_id, progress', [req.body.progress, req.body.post_id], function(err, result) {
                            if (err) { console.log(err); }

                            if (result !== undefined && result.rowCount > 0) {
                                resp.send({status: 'success', post_id: result.rows[0].post_id, progress: result.rows[0].progress});
                            }
                        });
                    }
                }
            });
        } else {
            pool.query('UPDATE coord_postings SET progress = $1 WHERE post_id = $2 RETURNING post_id, progress', [req.body.progress, req.body.post_id], function(err, result) {
                if (err) { console.log(err); }

                if (result !== undefined && result.rowCount > 0) {
                    resp.send({status: 'success', post_id: result.rows[0].post_id, progress: result.rows[0].progress});
                }
            });
        }
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

/* app.post('/revoke-applicant', function(req, resp) {
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
}); */

/* app.post('/job/start', function(req, resp) {
    if (req.session.username) {
        if (req.session.role === 'coordinator') {
            pool.query('SELECT * FROM applicants WHERE post_id = $1 AND accepted = true', [req.body.post_id], function(err, result) {
                if (err) { console.log(err) }
                console.log(result);

                if (result !== undefined && result.rows.length === 0) {
                    resp.send({status: 'empty'});
                } else {
                    pool.query("UPDATE coord_postings SET progress = 'In Progress' WHERE post_id = $1", [req.body.post_id], function(err, result) {
                        if (err) {
                            console.log(err);
                            resp.send({status: 'fail'});
                        } else if (result !== undefined && result.rowCount > 0) {
                            resp.send({status: 'success'});
                        }
                    });
                }
            });
        }
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
}); */

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
    function getNoticeUser(mail_title,post_url,role){
        let email_role;
        if(role === 'coordinator'){
            email_role = 'ti'
        }else if (role === 'ti'){
            email_role = 'coordinator'
        }
        pool.query("SELECT email FROM users WHERE email_notification = true and user_id != $1 and role = $2",[req.session.user_id,email_role]
        ,function(err,result){
            if(err){
                console.log(err);
            }else {
                for(i=0;i<result.rows.length;i++){
                    mailer.newPostNotification(mail_title,result.rows[i].email,post_url)
                }   
            }
        }) 
    }
    
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

        pool.query('INSERT INTO coord_postings (title, school, detail, user_id, type, num_of_interpreter, num_of_transcriber, verified, screened, on_what_day, course_number, time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING post_id', [req.body.title, req.body.school, req.body.details, req.session.user_id, req.body.type, req.body.how_many_int, req.body.how_many_tra, isVerified, isScreened, req.body.when, req.body.course_number, req.body.time], function(err, result) {
            if (err) {
                console.log(err);
                resp.send({status: 'fail'});
            } else if (result !== undefined && result.rowCount > 0) {
                getNoticeUser("[New Post] " + req.body.title,req.get('host')+'/posting-details?post_id='+result.rows[0].post_id+'&role=coordinator',req.session.role);
                resp.send({status: 'success'});
            }
        });
    } else if (req.session.role === 'ti') {
        if (typeof req.body.days === 'object') {
            var daysAvailable = req.body.days.join(', ');
        } else {
            var daysAvailable = req.body.days;
        }

        pool.query('INSERT INTO ti_postings (title, time_available, days_available, recurring, user_id, starting, details) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING post_id', [req.body.title, req.body.time, daysAvailable, req.body.recurring, req.session.user_id, req.body.starting, req.body.details], function(err, result) {
            if (err) {
                console.log(err);
                resp.send({status: 'fail'});
            } else if (result !== undefined && result.rowCount > 0) {
                getNoticeUser("[New Post] "+req.body.title, req.get('host')+'/posting-details?post_id='+result.rows[0].post_id+'&role=ti',req.session.role);
                resp.send({status: 'success'});
            }
        });
    } else if (req.session.role === 'admin') {
        render('blocks/404', {user: req.session, message: 'no'});
    }
});

app.get('/post-created', function(req, resp) {
    if (req.session.username) {
        resp.render('blocks/post-created', {user: req.session});
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
});

// ------------- Admin Panel --------------
app.get("/admin-panel",function(req,res){
    if(req.session.role === 'admin'){
        res.render("blocks/admin-panel");
    }else{
        res.render("blocks/login", {message:"Please login as admin"});
    }
})

// ------ manage user ------
app.post("/manage-user",function(req,res){
    // search user
    if(req.body.type == "get"){
        let match_input = "%"+req.body.input_value+"%";
        pool.query("SELECT * FROM users WHERE LOWER(username) LIKE LOWER($1) OR LOWER(email) LIKE LOWER($1) OR CAST(user_id as varchar) =$2 ORDER BY user_id"
        ,[match_input,req.body.input_value]
        ,function(err,result){
            if(err){
                console.log(err);
                res.send({status:"fail"});
            }else if (result.rows.length > 0 ){
                res.send(result.rows);
            }else if(result.rows.length == 0){
                res.send({status:"no user found"});
            }
        })
    }
    // verify user
    if(req.body.type == "verify"){
        let user_array = req.body.user_array;
        let user_arr_sql = "(";
        for(i=0; i<user_array.length;i++){
            if(i==user_array.length-1){
                user_arr_sql+=user_array[i]+")"
            }else{
                user_arr_sql+=user_array[i]+","
            }
        }
        pool.query("UPDATE users SET is_verified = true WHERE user_id IN "+user_arr_sql
        ,[]
        ,function(err,result){
            if(err){
                console.log(err);
                res.send({status:"fail"});
            }else{
                res.send({
                    status:"success",
                    row_updated:result.rowCount,
                })
            }
        })
        
    }
    // screen user
    if(req.body.type == "screen"){
        let user_array = req.body.user_array;
        let user_arr_sql = "(";
        for(i=0; i<user_array.length;i++){
            if(i==user_array.length-1){
                user_arr_sql+=user_array[i]+")"
            }else{
                user_arr_sql+=user_array[i]+","
            }
        }
        pool.query("UPDATE users SET is_screened = true WHERE user_id IN "+user_arr_sql
        ,[]
        ,function(err,result){
            if(err){
                console.log(err);
                res.send({status:"fail"});
            }else{
                res.send({
                    status:"success",
                    row_updated:result.rowCount,
                })
            }
        })
        
    }
    // delete user
    if(req.body.type == "delete"){
        let user_array = req.body.user_array;
        let user_arr_sql = "(";
        for(i=0; i<user_array.length;i++){
            if(i==user_array.length-1){
                user_arr_sql+=user_array[i]+")"
            }else{
                user_arr_sql+=user_array[i]+","
            }
        }
        pool.query("UPDATE users SET suspended=true WHERE user_id IN "+user_arr_sql
        ,[]
        ,function(err,result){
            if(err){
                console.log(err);
                res.send({status:"fail"});
            }else{
                res.send({
                    status:"success",
                    row_updated:result.rowCount,
                })
            }
        })
        
    }
    // unsuspend user
    if(req.body.type == "undo-delete"){
        let user_array = req.body.user_array;
        let user_arr_sql = "(";
        for(i=0; i<user_array.length;i++){
            if(i==user_array.length-1){
                user_arr_sql+=user_array[i]+")"
            }else{
                user_arr_sql+=user_array[i]+","
            }
        }
        pool.query("UPDATE users SET suspended=false WHERE user_id IN "+user_arr_sql
        ,[]
        ,function(err,result){
            if(err){
                console.log(err);
                res.send({status:"fail"});
            }else{
                res.send({
                    status:"success",
                    row_updated:result.rowCount,
                })
            }
        })
        
    }

    // promote user
    if(req.body.type == "promote"){
        let user_array = req.body.user_array;
        let user_arr_sql = "(";
        for(i=0; i<user_array.length;i++){
            if(i==user_array.length-1){
                user_arr_sql+=user_array[i]+")"
            }else{
                user_arr_sql+=user_array[i]+","
            }
        }
        pool.query("UPDATE users SET role='admin' WHERE user_id IN "+user_arr_sql
        ,[]
        ,function(err,result){
            if(err){
                console.log(err)
                res.send({
                    status:"fail"
                })
            }else {
                res.send({
                    status:"success",
                    row_updated:result.rowCount
                })
            }
        })
    }
})

// ------ manage post -------
app.get('/manage-post-edit',function(req,resp){
    if (req.session.username && req.session.role=="admin") {
        if(req.query.post_type=="coord"){
            console.log("coord")
            var queryString = 'SELECT * FROM coord_postings WHERE post_id = $1';
        }else if(req.query.post_type=="ti"){
            console.log("ti")
            var queryString = 'SELECT * FROM ti_postings WHERE post_id = $1';
        }
        console.log(queryString);

        pool.query(queryString, [req.query.post_id], function(err, result) {
            if (err) { console.log(err); }

            if (result !== undefined) {
                console.log(result.rows.length)
                resp.render('blocks/edit-post', {user: req.session,post_type:req.query.post_type, post: result.rows[0]});
            }
        })
    }else{
        resp.render('block/login')
    }
})
app.post("/manage-post",function(req,res){
    // search post from coordinator postings
    if(req.body.type=="get-co"){
        let match_input = "%"+req.body.input_value+"%";
        pool.query("SELECT *,TO_CHAR(date_created, 'YYYY-MM-DD') as date_created FROM coord_postings WHERE (LOWER(title) LIKE LOWER($1) OR CAST(post_id as varchar) = $2) AND is_archived=false ORDER BY post_id"
        ,[match_input,req.body.input_value]
        ,function(err,result){
            if(err){
                console.log(err);
                res.send({status:"fail"});
            }else if (result.rows.length > 0 ){
                res.send(result.rows);
            }else if(result.rows.length == 0){
                res.send({status:"no post found"});
            }
        })
    }
    // search post from interpreter postings
    if(req.body.type=="get-ti"){
        let match_input = "%"+req.body.input_value+"%";
        pool.query("SELECT *,TO_CHAR(ti_postings.date_created, 'YYYY-MM-DD') as date_created,TO_CHAR(ti_postings.starting, 'YYYY-MM-DD') as starting FROM users,ti_postings WHERE (LOWER(title) LIKE LOWER($1) OR CAST(post_id as varchar) = $2) AND users.user_id = ti_postings.user_id AND is_archived=false ORDER BY ti_postings.post_id"
        ,[match_input,req.body.input_value]
        ,function(err,result){
            if(err){
                console.log(err);
                res.send({status:"fail"});
            }else if (result.rows.length > 0 ){
                res.send(result.rows);
            }else if(result.rows.length == 0){
                res.send({status:"no post found"});
            }
        })
    }
    // delete post
    if(req.body.type=="delete"){
        let co_post_array = [];
        let ti_post_array = [];
        let co_post_arr_sql = "(0)";
        let ti_post_arr_sql = "(0)";

        if(req.body.co_post_array){
            co_post_array = req.body.co_post_array
            co_post_arr_sql = "("
        }

        if(req.body.ti_post_array){
            ti_post_array = req.body.ti_post_array
            ti_post_arr_sql = "("
        }
        
        for(i=0; i<co_post_array.length;i++){
            if(i==co_post_array.length-1){
                co_post_arr_sql+=co_post_array[i]+")"
            }else{
                co_post_arr_sql+=co_post_array[i]+","
            }
        }
        for(i=0; i<ti_post_array.length;i++){
            if(i==ti_post_array.length-1){
                ti_post_arr_sql+=ti_post_array[i]+")"
            }else{
                ti_post_arr_sql+=ti_post_array[i]+","
            }
        }
        console.log(ti_post_arr_sql,co_post_arr_sql);
        pool.query("UPDATE coord_postings SET is_archived=true WHERE post_id IN "+co_post_arr_sql
        ,[]
        ,function(err,result){
            if(err){
                console.log(err);
                res.send({status:"fail"});
            }else{
                console.log(ti_post_arr_sql)
                pool.query("UPDATE ti_postings SET is_archived=true WHERE post_id IN "+ti_post_arr_sql
                ,[]
                ,function(err,result){
                    if(err){
                        console.log(err);
                        res.send({status:"fail"});
                    }else{
                        res.send({
                            status:"success",
                            row_updated:co_post_array.length+ti_post_array.length,
                        })
                    }
                })
            }
        })
     
    }
})

app.post("/set-post-progress",function(req,res){
    set_post_progress(req,res);
})

function set_post_progress(req,res){
    let co_post_array = [];
    let co_post_arr_sql = "(0)";

    if(req.body.co_post_array){
        co_post_array = req.body.co_post_array
        co_post_arr_sql = "("
    }

    for(i=0; i<co_post_array.length;i++){
        if(i==co_post_array.length-1){
            co_post_arr_sql+=co_post_array[i]+")"
        }else{
            co_post_arr_sql+=co_post_array[i]+","
        }
    }

    let query = "UPDATE coord_postings SET progress=$1 WHERE post_id IN "+co_post_arr_sql;

    pool.query(query,[req.body.status],function(err,result){
        if(err){
            console.log(err);
            res.send({status:"fail"});
        }else{
            res.send({
                status:"success",
                row_updated:co_post_array.length,
            })
        }
    })
}

app.post('/get-user-post-info', function(req, resp) {
    if (req.session.username) {
        if (req.session.role === 'coordinator') {
            pool.query('SELECT COUNT(*) AS total_posts FROM coord_postings WHERE user_id = $1', [req.body.user_id], function(err, result) {
                if (err) { console.log(err); }

                if (result !== undefined) {
                    resp.send({status: 'success', total_posts: result.rows[0].total_posts, total_app: 0});
                }
            });
        } else if (req.session.role === 'ti') {
            pool.query('SELECT COUNT(*) AS total_posts FROM ti_postings WHERE user_id = $1', [req.body.user_id], function(err, result) {
                if (err) { console.log(err); }

                var total_posts = result.rows[0].total_posts;
                
                pool.query('SELECT COUNT(*) AS total_app FROM applicants WHERE applicant_id = $1', [req.body.user_id], function(err, result) {
                    if (err) { console.log(err); }

                    var total_app = result.rows[0].total_app;

                    if (result !== undefined) {
                        resp.send({status: 'success', total_posts: total_posts, total_app: total_app});
                    }
                })
            })
        }
    } else {
        resp.render('blocks/login', {message: "You're not logged in"});
    }
})

// ----- get data -------
app.post('/data',function(req,res){
    if(req.body.type=="school"){
        pool.query('select count(post_id),school from coord_postings group by school order by count desc',[],function(err,result){
            if(err){res.send('err')}
            else if(result){
                res.send({
                    status:"success",
                    schools:result.rows
                })
            }
        })
    }

    if(req.body.type=="post"){
        pool.query('select (select count(*) from ti_postings) as ti_post_count,(select count(*) from coord_postings) as co_post_count from coord_postings limit 1',[]
        ,function(err,result){
            if(err){
                console.log(err)
            }else if(result){
                res.send({
                    status:"success",
                    data:result.rows
                })
            }
        })
    }

    if(req.body.type=="co-monthly-post"){
        pool.query("select count(*),to_char(date_created,'YYYY-MM') as month from coord_postings group by month order by month asc",[]
        ,function(err,result){
            if(err){
                console.log(err)
            }else if(result){
                res.send({
                    status:"success",
                    data:result.rows
                })
            }
        })
    }

    if(req.body.type=="ti-monthly-post"){
        pool.query("select count(*),to_char(date_created,'YYYY-MM') as month from ti_postings group by month order by month asc",[]
        ,function(err,result){
            if(err){
                console.log(err)
            }else if(result){
                res.send({
                    status:"success",
                    data:result.rows
                })
            }
        })
    }

    if(req.body.type=="post_status"){
        pool.query('select count(*),progress from coord_postings group by progress',[]
        ,function(err,result){
            if(err){
                console.log(err)
            }else if(result){
                res.send({
                    status:"success",
                    data:result.rows
                })
            }
        })
    }

    if(req.body.type=="post-progress"){
        pool.query("select count(*),progress from coord_postings group by progress order by case when progress='Open' then 1 When progress='Fulfilled' then 2 when progress='In Progress' then 3 when progress='Complete' then 4 END",[]
        ,function(err,result){
            if(err){
                console.log(err)
            }else if(result){
                res.send({
                    status:"success",
                    data:result.rows
                })
            }
        })
    }

    if(req.body.type=="user-type"){
        pool.query("select count(*),role from users group by role order by case when role='coordinator' then 1 when role='ti' then 2 when role='admin' then 3 END",[]
        ,function(err,result){
            if(err){
                console.log(err)
            }else if(result){
                res.send({
                    status:"success",
                    data:result.rows
                })
            }
        })
    }

    if(req.body.type=="ti-demand"){
        pool.query("select sum(num_of_transcriber) as d_trans, sum(num_of_interpreter) as d_inter,to_char(date_created,'YYYY-MM') as month from coord_postings group by month",[]
        ,function(err,result){
            if(err){
                console.log(err)
            }else if(result){
                res.send({
                    status:"success",
                    data:result.rows
                })
            }
        })
    }
    
})


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