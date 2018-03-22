$(document).ready(function() {
    $('.activate').on('submit', function(e) {
        e.preventDefault();

        var form = $(this);

        activatePost(form);
    });

    $('.deactivate').on('submit', function(e) {
        e.preventDefault();

        var form = $(this);

        deactivatePost(form);
    });

    $('.delete-post').on('submit', function(e) {
        e.preventDefault();

        var form = $(this);
        console.log($(this).serialize())

        alertify
        .okBtn('Yes')
        .cancelBtn('No')
        .confirm('Are you sure you want to delete this post?<br><small>You cannot revert this</small>', function(e) {
            $.ajax({
                method: 'POST',
                url: '/delete-post',
                data: form.serialize(),
                success: function(resp) {
                    console.log(resp);
                    if (resp.status === 'success') {
                        alertify.alert('Post successfully deleted');
                        $(form).parent().parent().remove();
                    } else if (resp.status === 'fail') {
                        alertify.alert('An error occurred. Please contact the administrator.');
                    }
                }
            });
        }, function(e) {
            return false;
        });
    });

    $('.job-complete').on('submit', function(e) {
        e.preventDefault();

        var form = $(this);

        jobComplete(form);
    });

    $('.job-start').on('submit', function(e) {
        e.preventDefault();

        var form = $(this);

        $.ajax({
            method: 'POST',
            url: '/job/start',
            data: form.serialize(),
            success: function(resp) {
                if (resp.status === 'empty') {
                    alertify.alert('You have not accepted any applicants to start this job.');
                } else if (resp.status === 'fail') {
                    alertify.alert('An error occurred.');
                } else if (resp.status === 'success') {
                    $(form).off('submit');
                    $(form).find('.status').removeClass('badge-primary').addClass('badge-warning').html('In Progress');
                    $(form).removeClass('job-start').addClass('job-complete');
                    $(form).find('input[type=submit]').removeClass('btn-success').addClass('btn-primary').attr('value', 'Complete');
                    $(form).on('submit', function(e) {
                        e.preventDefault();

                        var thisForm = $(this);

                        jobComplete(thisForm);
                    });
                }
            }
        });
    });
});