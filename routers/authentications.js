const app = require('express').Router();
const regex = require('../utils/regex');
const pool = require('../utils/db');
const bcrypt = require('bcrypt');

// -----------Register ---------------------------//
app.post("/register", function(req, resp) {
	console.log(req.body)
    var tocken = randomstring.generate()
    host=req.get('host');
    
    if (regex.string.test(req.body.username) && regex.string.test(req.body.fname)&& regex.string.test(req.body.lname) && regex.password.test(req.body.pass) && regex.phone.test(req.body.phone) && regex.phone.test(req.body.otherPhone) ){
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
    if(regex.string.test(req.body.username) && regex.password.test(req.body.password)){
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

    if(regex.email.test(req.query.email) == false || regex.string.test(req.query.tc) == false){
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
    if(regex.email.test(req.body.email)){
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

    if(regex.email.test(req.query.email) == false || regex.string.test(req.query.tc) == false){
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


    if(regex.password.test(req.body.password)){
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
});

module.exports = app;