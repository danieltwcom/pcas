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

    $('.select-progress').on('change', function(e) {
        var selector = $(this);
        var form = $(this).parent();

        form.on('submit', function(e) {
            e.preventDefault();
            
            var thisForm = $(this);
    
            $.ajax({
                method: 'POST',
                url: '/change-progress',
                data: thisForm.serialize(),
                success: function(resp) {
                    console.log(resp);
                    if (resp.status === 'empty') {
                        alertify.okBtn('Ok').alert('There are no applicants to change the progress.');
                    } else if (resp.status === 'fail') {
                        alertify.okBtn('Ok').alert('An error occurred.');
                    } else if (resp.status === 'success') {
                        form.off('submit');
                        if (resp.progress === 'Open') {
                            alertify.okBtn('Ok').alert('Progress changed to "Open".');
                            $('#progress-' + resp.post_id).removeAttr('class').attr('class', 'badge badge-primary').html('Open');
                        } else if (resp.progress === 'Fulfilled') {
                            alertify.okBtn('Ok').alert('Progress changed to "Fulfilled".');
                            $('#progress-' + resp.post_id).removeAttr('class').attr('class', 'badge badge-info').html('Fulfilled');
                        } else if (resp.progress === 'In Progress') {
                            alertify.okBtn('Ok').alert('Progress changed to "In Progress".');
                            $('#progress-' + resp.post_id).removeAttr('class').attr('class', 'badge badge-warning').html('In Progress');
                        } else if (resp.progress === 'Complete') {
                            alertify.okBtn('Ok').alert('Progress complete. Be sure to upvote the users if you enjoyed working with them.');
                            $('#progress-' + resp.post_id).removeAttr('class').attr('class', 'badge badge-success').html('Complete');
                            $(selector).remove();
                        }
                    }
                }
            });
        });

        if ($(selector).val() === 'Complete') {
            var confirmMessage = 'Are you sure you want to complete this job?<br><small><b>Warning:</b> You cannot revert this</small>';
        } else {
            var confirmMessage = 'Are you sure you want to change the progress of this job?';
        }

        alertify
        .okBtn('Yes')
        .cancelBtn('No')
        .confirm(confirmMessage, function(e) {
            form.submit();
        }, function(e) {
            $(selector).prop('selectedIndex', 0);
        });
    });
});