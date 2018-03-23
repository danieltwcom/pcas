$(document).ready(function() {
    console.log('reset.js')
    var passwordRegex = /^[^ \s]{4,15}$/,
    	password = $("#password")[0],
    	confirm_password = $("#repassword")[0];



    password.onkeyup = function(){
		regexTest(password,passwordRegex)
		if(confirm_password.value==password.value){
			confirm_password.style.boxShadow='0 0 0 0.2rem rgba(0,123,255,.25)';
		} else {
			confirm_password.style.boxShadow='0 0 0 0.2rem rgba(234,12,95,.5)';
		}
	};
	
	confirm_password.onkeyup = function(){
		regexTest(confirm_password,passwordRegex)
		if(confirm_password.value==password.value){
			confirm_password.style.boxShadow='0 0 0 0.2rem rgba(0,123,255,.25)';
		} else {
			confirm_password.style.boxShadow='0 0 0 0.2rem rgba(234,12,95,.5)';
		}
	};



    function regexTest (variable,regex){
		console.log(regex.test(variable.value))
        if(regex.test(variable.value)){

            variable.style.boxShadow='0 0 0 0.2rem rgba(0,123,255,.25)';
            
            
        } else {
            variable.style.boxShadow='0 0 0 0.2rem rgba(234,12,95,.5)';
            
            
        }
			
	}
})