var nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
          service:'gmail',
          auth: {
              user: 'bcitpcas@gmail.com',
              pass: 'acit4990'
          }
      });

var emailVerify = function (req,res,next){
	
    
	const body = 'Hi there, <br/> Thank you for registering! <br/><br/> Please verify your account by typing the flowing link. <br/> <a href = '+req.link+'>'+ req.link + ' </a>'
	
	let mailOptions = {
          from:'bcitpcas@gmail.com', // sender address
          to: req.reciver, // list of receivers
          subject: "pcas verification", // Subject line
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

module.exports = {
	emailVerify:emailVerify,
  emailForgetPass:emailForgetPass
}

