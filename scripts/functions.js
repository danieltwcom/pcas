function activatePost(form) {
    $.ajax({
        method: 'POST',
        url: '/activate-post',
        data: $(form).serialize(),
        success: function(resp) {
            if (resp.status === 'success') {
                alertify.alert('Your post is now visible to other users');
                $(form).attr('action', '/deactivate-post').removeClass('activate').addClass('deactivate');;
                $(form).find('input[type=submit]').removeClass('btn-primary').addClass('btn-danger').attr('value', 'Hide');
                $(form).off('submit');
                $(form).on('submit', function(e) {
                    e.preventDefault();

                    var thisForm = $(this);

                    deactivatePost(thisForm);
                });
            } else if (resp.status === 'fail') {
                alertify.alert('An error occurred. Please contact the administrator.');
            }
        }
    });
}

function deactivatePost(form) {
    $.ajax({
        method: 'POST',
        url: '/deactivate-post',
        data: $(form).serialize(),
        success: function(resp) {
            if (resp.status === 'success') {
                alertify.alert('Your post will be hidden to other users');
                $(form).attr('action', '/activate-post').removeClass('deactivate').addClass('activate');
                $(form).find('input[type=submit]').removeClass('btn-danger').addClass('btn-primary').attr('value', 'Show');
                $(form).off('submit');
                $(form).on('submit', function(e) {
                    e.preventDefault();

                    var thisForm = $(this);

                    activatePost(thisForm);
                });
            } else if (resp.status === 'fail') {
                alertify.alert('An error occurred. Please contact the administrator.');
            }
        }
    });
}

function acceptApplicant(form) {
    $.ajax({
        method: 'POST',
        url: '/accept-applicant',
        data: form.serialize(),
        success: function(resp) {
            if (resp.status === 'success') {
                $(form).find('input[type=hidden]').remove();
                $(form).removeAttr('class method action');
                $(form).find('input[type=submit]').attr({'disabled': 'disabled', 'value': 'Accepted'});
                /* $(form).removeClass('accept-applicant').addClass('revoke-applicant').attr('action', '/revoke-applicant');
                $(form).find('input[type=submit]').removeClass('btn-success').addClass('btn-danger').attr('value', 'Revoke');
                $(form).off('submit');
                $(form).on('submit', function(e) {
                    e.preventDefault();

                    var thisForm = $(this);

                    revokeApplicant(thisForm);
                }); */
            } else if (resp.status === 'fail') {
                alertify.alert('An error occurred. Please contact the administrator.');
            } else if (resp.status === 'exceeded') {
                alertify.alert('The number of requested applicants has been fulfilled.')
            }
        }
    });
}

function createPost(form) {    
    $.ajax({
        method: 'POST',
        url: '/new-post',
        data: form.serialize(),
        success: function(resp) {
            if (resp.status === 'success') {
                localStorage.clear();
                location.href = '/post-created';
            } else if (resp.status === 'fail') {
                alert('an error occurred');
            }
        }
    });
}

/* function revokeApplicant(form) {
    $.ajax({
        method: 'POST',
        url: '/revoke-applicant',
        data: form.serialize(),
        success: function(resp) {
            if (resp.status === 'success') {
                $(form).removeClass('revoke-applicant').addClass('accept-applicant').attr('action', '/accept-applicant');
                $(form).find('input[type=submit]').removeClass('btn-danger').addClass('btn-success').attr('value', 'Accept');
                $(form).off('submit');
                $(form).on('submit', function(e) {
                    e.preventDefault();

                    var thisForm = $(this);

                    acceptApplicant(thisForm);
                });
            }  else if (resp.status === 'fail') {
                alertify.alert('An error occurred. Please contact the administrator.');
            }
        }
    });
} */

function upvote(form) {
    $.ajax({
        method: 'POST',
        url: '/application/upvote',
        data: form.serialize(),
        success: function(resp) {
            console.log(resp);
            if (resp.status === 'voted') {
                alertify.alert('You can only vote once per completed job');
            } else if (resp.status === 'incomplete') {
                alertify.alert('You must complete the job first before upvoting');
            } else if (resp.status === 'success') {
                alertify.alert('Upvoted');
                $(form).find('input').remove()
            }
        }
    });
}

function getDocuments(user_id, div) {
    $.ajax({
        method: 'POST',
        url: '/get-documents',
        data: {
            user_id: user_id
        },
        success: function(resp) {
            console.log(resp);
        }
    });
}