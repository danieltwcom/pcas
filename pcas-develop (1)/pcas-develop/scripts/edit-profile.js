$(document).ready(function() {

    var first_name= $('#first_name')[0],
    	 last_name= $('#last_name')[0],
    	 school = $('#school')[0],
    	 location = $('#location')[0],
    	 phone = $('#phone')[0],
    	 altPhone= $('#other_phone')[0],
    	 age= $('#age')[0],
    	 gender= $('#gender')[0],
    	 desc= $('#desc')[0],
    	 update_profile= $('#update_profile')[0],
    	 email= $('#email')[0],
    	 confirm_email= $('#confirm_email')[0],
    	 update_email= $('#update_email')[0],
    	 current_password= $('#current_password')[0],
    	 newpassword= $('#newpassword')[0],
    	 confirm_password= $('#confirm_password')[0],
    	 update_pass= $('#update_pass')[0]


    var usernameRegex = /^[a-zA-Z0-9\-_]{4,20}$/;
	var nameRegex = /^[a-zA-Z]{1,15}$/;
	var emailRegex = /^[a-zA-Z0-9\._\-]{1,50}@[a-zA-Z0-9_\-]{1,50}(.[a-zA-Z0-9_\-])?.(ca|com|org|net|info|us|cn|co.uk|se)$|^[a-zA-Z0-9\._\-]{1,50}@[a-zA-Z0-9_\-]{1,50}(.[a-zA-Z0-9_\-])?.[a-zA-Z0-9_\-]{1,50}(.[a-zA-Z0-9_\-])?.(ca|com|org|net|info|us|cn|co.uk|se)$/;
	var passwordRegex = /^[^ \s]{4,15}$/;
	var phoneRegex = /^$|^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
	var stringRegex = /^$|^[a-zA-Z0-9\-_]{1,50}$/;
	var numberRegex = /^$|^[0-9]{1,2}$|100/

	$.ajax({
		url:"/read-profile",
		type:"post",
		success:function(resp){
			console.log(resp)
			first_name.value=resp.first_name,
			last_name.value=resp.last_name,
			location.value=resp.location,
			phone.value=resp.phone_number,
			other_phone=resp.other_phone,
			age.value=resp.age,
			gender.value=resp.gender,
			desc.value=resp.description			
		}
	})

	first_name.onkeyup = function(){
		regexTest(first_name,nameRegex)
	};
	
	last_name.onkeyup = function(){
		regexTest(last_name,nameRegex)
	};
	
	location.onkeyup = function(){
		regexTest(location,stringRegex)
	}
	email.onkeyup = function(){
		regexTest(email,emailRegex)
		if(confirm_email.value==email.value){
			confirm_email.style.boxShadow='0 0 0 0.2rem rgba(0,123,255,.25)';
		} else {
			confirm_email.style.boxShadow='0 0 0 0.2rem rgba(234,12,95,.5)';
		}
	};
    age.onkeyup = function(){
    	regexTest(age,numberRegex)
    }
	confirm_email.onkeyup = function(){
		regexTest(confirm_email,emailRegex)
		if(confirm_email.value==email.value){
			confirm_email.style.boxShadow='0 0 0 0.2rem rgba(0,123,255,.25)';
		} else {
			confirm_email.style.boxShadow='0 0 0 0.2rem rgba(234,12,95,.5)';
		}
	};
	newpassword.onkeyup = function(){
		regexTest(newpassword,passwordRegex)
		if(confirm_password.value==newpassword.value){
			confirm_password.style.boxShadow='0 0 0 0.2rem rgba(0,123,255,.25)';
		} else {
			confirm_password.style.boxShadow='0 0 0 0.2rem rgba(234,12,95,.5)';
		}
	};
	
	confirm_password.onkeyup = function(){
		regexTest(confirm_password,passwordRegex)
		if(confirm_password.value==newpassword.value){
			confirm_password.style.boxShadow='0 0 0 0.2rem rgba(0,123,255,.25)';
		} else {
			confirm_password.style.boxShadow='0 0 0 0.2rem rgba(234,12,95,.5)';
		}
	};
	phone.onkeyup = function(){
		regexTest(phone,phoneRegex)
	}
	
	altPhone.onkeyup = function(){
		regexTest(altPhone,phoneRegex)
	}


	



	function regexTest (variable,regex){
		console.log(regex.test(variable.value))
        if(regex.test(variable.value)){
            variable.style.boxShadow='0 0 0 0.2rem rgba(0,123,255,.25)';
            
        } else {
            variable.style.boxShadow='0 0 0 0.2rem rgba(234,12,95,.5)';
     
            
        }
			
	}
})