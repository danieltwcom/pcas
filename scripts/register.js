$(document).ready(function() {
    console.log("register.js")	
	var username = register_from.elements['username'];
	var job =  register_from.elements['who-are-you'];
	var first_name = register_from.elements['first_name'];
	var last_name = register_from.elements['last_name'];
	var email = register_from.elements['email'];
	var confirm_email = register_from.elements['confirm_email'];
	var password = register_from.elements['password'];
	var confirm_password = register_from.elements['confirm_password'];
	var school = register_from.elements['school'];
	var phone = register_from.elements['phone'];
	var altPhone = register_from.elements['other-phone'];
	var desp = register_from.elements['description'];
	var submitBu = $('#Submit');
	
	var usernameRegex = /^[a-zA-Z0-9\-_]{4,20}$/;
	var nameRegex = /^[a-zA-Z]{1,15}$/;
	var emailRegex = /^[a-zA-Z0-9\._\-]{1,50}@[a-zA-Z0-9_\-]{1,50}(.[a-zA-Z0-9_\-])?.(ca|com|org|net|info|us|cn|co.uk|se)$/;
	var passwordRegex = /^[^ \s]{4,15}$/;
	var phoneRegex = /^[0-9\-]{10,12}$/;
	var checkDic = {"username":0,
				   "first_name":0,
				   "last_name":0,
				   "email":0,
				   "confirm_email":0,
				   "password":0,
				   "confirm_password":0
				   }
	console.log(checkDic.hasOwnProperty("username"))
	username.onkeyup = function(){
		regexTest(username,"username",usernameRegex)
	};
	
	first_name.onkeyup = function(){
		regexTest(first_name,"first_name",nameRegex)
	};
	
	last_name.onkeyup = function(){
		regexTest(last_name,"last_name",nameRegex)
	};
	
	email.onkeyup = function(){
		regexTest(email,"email",emailRegex)
		if(confirm_email.value==email.value){
			confirm_email.style.color="black"
		} else {
			confirm_email.style.color="red"
		}
	}
	
	confirm_email.onkeyup = function(){
		regexTest(confirm_email,"confirm_email",emailRegex)
		if(confirm_email.value==email.value){
			confirm_email.style.color="black"
		} else {
			confirm_email.style.color="red"
		}
	}
	
	password.onkeyup = function(){
		regexTest(password,"password",passwordRegex)
		if(confirm_password.value==password.value){
			confirm_password.style.color="black"
		} else {
			confirm_password.style.color="red"
		}
	}
	
	confirm_password.onkeyup = function(){
		regexTest(confirm_password,"confirm_password",passwordRegex)
		if(confirm_password.value==password.value){
			confirm_password.style.color="black"
		} else {
			confirm_password.style.color="red"
		}
	}
	
	phone.onkeyup = function(){
		regexTest(phone,"phone",phoneRegex)
	}
	
	altPhone.onkeyup = function(){
		regexTest(altPhone,"altPhone",phoneRegex)
	}
	
	
	
	function regexTest (variable,variableName,regex){
		if(checkDic.hasOwnProperty(variableName)){
			if(regex.test(variable.value)){
				variable.style.color='black';
				checkDic[variableName] = 1;
			} else {
				variable.style.color='red';
				checkDic[variableName] = 0;
			}
			
		} else {
			if(regex.test(variable.value)){
				variable.style.color='black';
			} else {
				variable.style.color='red';
			}
			
		}
		
	}
	
	submitBu.on('click', function(e) {
		
		for (var key in checkDic){
			if (checkDic[key] == 0){
				console.log(key)
				register_from.elements[key].focus();
				register_from.elements[key].select();
				return;
			} 
		}
		console.log(password.value);
		console.log("success")
		$.ajax({
            url:"/register",
            type:"post",
            data:{
                username:username.value,
				job:job.value,
				fname:first_name.value,
				lname:last_name.value,
				email:email.value,
				pass:password.value,
				school:school.value,
				phone:phone.value,
				otherPhone:altPhone.value,
				desp:desp.value
            },
            success:function(resp) {
				console.log('test')
				location.href = '/';
            }
        });
		
    });
})