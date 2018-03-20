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

        alertify
        .okBtn('Yes')
        .cancelBtn('No')
        .confirm('Are you sure you want to delete this post?<br><small>You cannot revert this</small>', function(e) {
            $.ajax({
                method: 'POST',
                url: '/delete-post',
                data: $(this).serialize(),
                success: function(resp) {
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

        $.ajax({
            method: 'POST',
            url: '/job/complete',
            data: $(this).serialize(),
            success: function(resp) {
                if (resp.status === 'success') {
                    $(form).find('input').remove();
                    $(form).find('.status').removeClass('badge-warning').addClass('badge-success').html('Complete');
                }
            }
        });
    });
});