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
	var altPhone = register_from.elements['other_phone'];
	var desp = register_from.elements['description'];
	var agree = register_from.elements['agree']
	var tscheck = document.getElementById("tscheck");
	var usernameRegex = /^[a-zA-Z0-9\-_]{4,20}$/;
	var nameRegex = /^[a-zA-Z]{1,15}$/;
	var emailRegex = /^[a-zA-Z0-9\._\-]{1,50}@[a-zA-Z0-9_\-]{1,50}(.[a-zA-Z0-9_\-])?.(ca|com|org|net|info|us|cn|co.uk|se)$|^[a-zA-Z0-9\._\-]{1,50}@[a-zA-Z0-9_\-]{1,50}(.[a-zA-Z0-9_\-])?.[a-zA-Z0-9_\-]{1,50}(.[a-zA-Z0-9_\-])?.(ca|com|org|net|info|us|cn|co.uk|se)$/;
	var passwordRegex = /^[^ \s]{4,15}$/;
	var phoneRegex = /^$|^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
    var checkDic = {
                    "username":0,
				   "first_name":0,
				   "last_name":0,
				   "email":0,
				   "confirm_email":0,
				   "password":0,
				   "confirm_password":0
				   }
    
//----------- Regex check -----------------//
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
			confirm_email.style.boxShadow='0 0 0 0.2rem rgba(0,123,255,.25)';
		} else {
			confirm_email.style.boxShadow='0 0 0 0.2rem rgba(234,12,95,.5)';
		}
	};
    
	confirm_email.onkeyup = function(){
		regexTest(confirm_email,"confirm_email",emailRegex)
		if(confirm_email.value==email.value){
			confirm_email.style.boxShadow='0 0 0 0.2rem rgba(0,123,255,.25)';
		} else {
			confirm_email.style.boxShadow='0 0 0 0.2rem rgba(234,12,95,.5)';
		}
	};
	
	password.onkeyup = function(){
		regexTest(password,"password",passwordRegex)
		if(confirm_password.value==password.value){
			confirm_password.style.boxShadow='0 0 0 0.2rem rgba(0,123,255,.25)';
		} else {
			confirm_password.style.boxShadow='0 0 0 0.2rem rgba(234,12,95,.5)';
		}
	};
	
	confirm_password.onkeyup = function(){
		regexTest(confirm_password,"confirm_password",passwordRegex)
		if(confirm_password.value==password.value){
			confirm_password.style.boxShadow='0 0 0 0.2rem rgba(0,123,255,.25)';
		} else {
			confirm_password.style.boxShadow='0 0 0 0.2rem rgba(234,12,95,.5)';
		}
	};
	phone.onkeyup = function(){
		regexTest(phone,"phone",phoneRegex)
	}
	
	altPhone.onkeyup = function(){
		regexTest(altPhone,"altPhone",phoneRegex)
	}
//------------Regex check end -----------//
    
//-------------    duplicate check ----------// 
	
	username.onfocusout = function(){
        if(usernameRegex.test(username.value)){
            $.ajax({
                url:"/duplicate_check",
                type:"post",
                data:{checkValue:username.value},
                success:function(resp){
                    if(resp.status=='success'){
                        $("#username")[0].innerHTML="&nbsp &nbsp Username can be used"
                         $("#username")[0].style.color='blue'
                         checkDic['username']=1
                         username.style.boxShadow='0 0 0 0.2rem rgba(0,123,255,.25)';
                    }
                    if(resp.status=='fail'){
                        $("#username")[0].innerHTML="&nbsp &nbsp Username already taken"
                         $("#username")[0].style.color='red'
                         checkDic['username']=0
                         username.style.boxShadow='0 0 0 0.2rem rgba(234,12,95,.5)';
                    }
                }
            })
        }
        if(usernameRegex.test(username.value)== false){
            $("#username")[0].innerHTML="&nbsp &nbsp Username invalid"
            $("#username")[0].style.color='red'
            
        }
        
    }
    
    email.onfocusout = function(){
        if(emailRegex.test(email.value)){
            $.ajax({
                url:"/duplicate_check",
                type:"post",
                data:{checkValue:email.value},
                success:function(resp){
                    if(resp.status=='success'){
                        $("#email")[0].innerHTML="&nbsp &nbsp Email can be used"
                         $("#email")[0].style.color='blue'
                         checkDic['email']=1
                        email.style.boxShadow='0 0 0 0.2rem rgba(0,123,255,.25)';
                    }
                    if(resp.status=='fail'){
                        $("#email")[0].innerHTML="&nbsp &nbsp Email already taken"
                        $("#email")[0].style.color='red'
                        checkDic['email']=0
                        email.style.boxShadow='0 0 0 0.2rem rgba(234,12,95,.5)';
                    }
                }
            })
            
            
        }
        if(emailRegex.test(email.value)== false){
            $("#email")[0].innerHTML="&nbsp &nbsp Email invalid"
            $("#email")[0].style.color='red'
            
        }
        
    }
	
//-------------    duplicate check end ----------// 
//------------- Submit -------------------------//

	 $("form").submit(function(e){
		 e.preventDefault();
		 if(!tscheck.checked){
		 	alertify.alert("Please read and agree the Terms and Services")
		 	return;
		 }

         for (var key in checkDic){
			if (checkDic[key] == 0){
				console.log(key)
				register_from.elements[key].focus();
				register_from.elements[key].select();
				return;
			} 
		}

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
				desp:desp.value,
				agree:agree.value
            },
            success:function(resp) {
                if(resp.status=="success"){
                    location.href = '/pleaseVerify';
                } else if(resp.status=="fail"){
                    alert.alertify(resp.message)
                } else if (resp.status === 'disagree') {
					alertify.alert('You must agree with the terms and services to complete the registration');
				}
				
            }
        });

            })
     
//--------------   Functions -------------------//
	
	function regexTest (variable,variableName,regex){
		console.log(regex.test(variable.value))
        if(regex.test(variable.value)){

            variable.style.boxShadow='0 0 0 0.2rem rgba(0,123,255,.25)';
            checkDic[variableName] = 1;
            
        } else {
            variable.style.boxShadow='0 0 0 0.2rem rgba(234,12,95,.5)';
            checkDic[variableName] = 0;
            
        }
			
	}
	
})