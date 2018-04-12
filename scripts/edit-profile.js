
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


	var checkDic = {
		"first_name":1,
		"last_name":1,
		"school":1,
		"location":1,
		"phonene":1,
		"altPhone":1,
		"age":1,
		"gender":1,
		"desc":1,
		"newpassword":1,
		"confirm_password":1,
		"email":1,
		"confirm_email":1

	}


	first_name.onkeyup = function(){
		regexTest(first_name,"first_name",nameRegex)
	};
	
	last_name.onkeyup = function(){
		regexTest(last_name,"last_name",nameRegex)
	};
	
	location.onkeyup = function(){
		regexTest(location,"location",stringRegex)
	}
	email.onkeyup = function(){
		regexTest(email,"email",emailRegex)
		if(confirm_email.value==email.value){
			confirm_email.style.boxShadow='0 0 0 0.2rem rgba(0,123,255,.25)';
		} else {
			confirm_email.style.boxShadow='0 0 0 0.2rem rgba(234,12,95,.5)';
		}
	};
    age.onkeyup = function(){
    	regexTest(age,"age",numberRegex)
    }
	confirm_email.onkeyup = function(){
		regexTest(confirm_email,"email",emailRegex)
		if(confirm_email.value==email.value){
			confirm_email.style.boxShadow='0 0 0 0.2rem rgba(0,123,255,.25)';
		} else {
			confirm_email.style.boxShadow='0 0 0 0.2rem rgba(234,12,95,.5)';
		}
	};
	newpassword.onkeyup = function(){
		regexTest(newpassword,"password",passwordRegex)
		if(confirm_password.value==newpassword.value){
			confirm_password.style.boxShadow='0 0 0 0.2rem rgba(0,123,255,.25)';
		} else {
			confirm_password.style.boxShadow='0 0 0 0.2rem rgba(234,12,95,.5)';
		}
	};
	
	confirm_password.onkeyup = function(){
		regexTest(confirm_password,"confirm_password",passwordRegex)
		if(confirm_password.value==newpassword.value){
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

/* 	$("form").submit(function(e){
		 e.preventDefault(e);
		 console.log("success")
         for (var key in checkDic){
			if (checkDic[key] == 0){
				console.log(key)
				edit_profile.elements[key].focus();
				edit_profile.elements[key].select();
				return;
			} 
		}
		$.ajax({
            url:"/edit-profile",
            type:"post",
            data:{
                first_name:first_name.value,
				last_name:last_name.value,
				location:location.value,
				phone:phone.value,
				other_phone:other_phone.value,
				pass:newpassword.value,
				age:age.value,
				gender:gender.value,
				desc:desc.value
            },
            success:function(resp) {
                if(resp.status=="success"){
                    alert(resp.message)
                }
                if(resp.status=="fail"){
                    alert(resp.message)
                }
				
            }
        });

            })
 */
	



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

	// deletes the credential from the user profile
	/* $(document).on('submit', 'form.delete-credential', function(e) {
		e.preventDefault();

		$(this).remove();
	}); */

	$('.custom-file-input').on('change', function() {
		let filepath = $(this).val();
		let lastSlash = filepath.lastIndexOf('\\');
		let filename = filepath.slice(lastSlash + 1);

		$('#upload-filename').html(filename)
	});

	$('#clear-upload').on('click', function() {
		$('#upload-filename').html('Choose file');
	});

/* 	$('.custom-file').on('submit', function(e) {
		e.preventDefault();
		var form = $(this);
		var formData = new FormData(form[0]);
		console.log(formData);
		console.log($('#upload-file'));

		jQuery.each(jQuery('#upload-file')[0].files, function(i, file) {
			console.log(file);
		});

		$.ajax({
			method: 'POST',
			url: '/upload-document',
			data: formData,
			success: function(resp) {
				$('#documents').append(
					$('<div>').html(resp.id)
				)
			},
			cache: false,
			contentType: false,
			processData: false
		})
	}) */

	$('.delete-document').on('submit', function(e) {
		e.preventDefault();

		var form = $(this);

		alertify
		.okBtn('Yes')
		.cancelBtn('No')
		.confirm('Are you sure you want to delete this document?', function(e) {
			$.ajax({
				method: 'POST',
				url: '/delete-document',
				data: form.serialize(),
				success: function(resp) {
					$('#document-' + resp.id).remove();
					alertify.alert('Document deleted.');
				}
			});
		}, function(e) {
			return false;
		});
	});
});