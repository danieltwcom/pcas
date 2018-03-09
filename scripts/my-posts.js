$(document).ready(function() {
    $('.activate').on('submit', function(e) {
        e.preventDefault();

        var form = $(this);

        $.ajax({
            method: 'POST',
            url: '/activate-post',
            data: $(this).serialize(),
            success: function(resp) {
                if (resp.status === 'success') {
                    alertify.alert('Your post is now visible to other users');
                    $(form).attr('action', '/deactivate-post');
                    $(form).find('input[type=submit]').removeClass('btn-primary').addClass('btn-danger').attr('value', 'Hide');
                } else if (resp.status === 'fail') {
                    alertify.alert('An error occurred. Please contact the administrator.');
                }
            }
        });
    });

    $('.deactivate').on('submit', function(e) {
        e.preventDefault();

        var form = $(this);

        $.ajax({
            method: 'POST',
            url: '/deactivate-post',
            data: $(this).serialize(),
            success: function(resp) {
                if (resp.status === 'success') {
                    alertify.alert('Your post will be hidden to other users');
                    $(form).attr('action', '/activate-post');
                    $(form).find('input[type=submit]').removeClass('btn-danger').addClass('btn-primary').attr('value', 'Show');
                } else if (resp.status === 'fail') {
                    alertify.alert('An error occurred. Please contact the administrator.');
                }
            }
        });
    });

    $('.delete-post').on('submit', function(e) {
        e.preventDefault();

        var form = $(this);

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
    });
});