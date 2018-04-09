var nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
          service:'gmail',
          auth: {
              user: 'bcitpcas@gmail.com',
              pass: 'acit4990'
          }
      });

var emailVerify = function (req,res,next){
	
    
	const body = 'Hello, <br/> User <b>'+req.user+'</b> is registering. <br/><br/> Please verify this account by click the flowing link. <br/> <a href = '+req.link+'>'+ req.link + ' </a>'
	
	let mailOptions = {
          from:'bcitpcas@gmail.com', // sender address
          to: req.reciver, // list of receivers
          subject: "PCAS New user[ "+ req.user+"] registering please verify", // Subject line
          html: body // html body
      };
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
          console.log('Message %s sent: %s', info.messageId, info.response);
              res.render('index');
          });
}

var emailVerifySuccess = function (req,res,next){
  
    
  const body = "Hello your account has been verified please click flowing link to loggin <br></br> <a href = "+ req.link + "> Log in </a>"  
  
  let mailOptions = {
          from:'bcitpcas@gmail.com', // sender address
          to: req.reciver, // list of receivers
          subject: "[PCAS] Your account has been verified", // Subject line
          html: body // html body
      };
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
          console.log('Message %s sent: %s', info.messageId, info.response);
              res.render('index');
          });
}

var emailForgetPass = function(req,res,next){
  const body = 'Please click flowing link to reset your password <br/> <a href = '+req.link+'> Reset Password </a>'
  let mailOptions = {
          from:'bcitpcas@gmail.com', // sender address
          to: req.reciver, // list of receivers
          subject: "PSAC Reset Password", // Subject line
          html: body // html body
      };
  transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
          console.log('Message %s sent: %s', info.messageId, info.response);
              res.render('index');
          });
}

let newPostNotification = function (mail_title,email,post_url){
    let mailOptions = {
        from:'pcasnotification@gmail.com',
        to: email,
        subject:mail_title,
        html:"Check out the post "+"<a href='http://"+post_url+"'>here</a>"// todo
    }
    transporter.sendMail(mailOptions,function(err,info){
        if(err){
            console.log(err)
        }else{
            console.log('Email sent: '+ info.response);
        }
    })
}

module.exports = {
	emailVerify:emailVerify,
    emailForgetPass:emailForgetPass,
    newPostNotification:newPostNotification,
    emailVerifySuccess:emailVerifySuccess,
}

