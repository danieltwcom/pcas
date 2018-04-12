$(document).ready(function() {
    $('#edit-profile-button').on('click', function() {
        location.href = '/edit-profile';
    });

    $('#upload-profile-pic-button').on('click', function() {
        $('#profile-pic-input').click();
    });

    $('#profile-pic-input').on('change', function() {
        $('#upload-profile-pic').submit();
    });

    $('#options').on('submit', function(e) {
        e.preventDefault();

        $.ajax({
            method: 'POST',
            url: '/apply-options',
            data: $(this).serialize(),
            success: function(resp) {
                if (resp.status === 'fail') {
                    alertify.alert('An error occurred. Please contact the administrator.');
                } else if (resp.status === 'success') {
                    alertify.alert('Options applied successfully');
                }
            }
        });
    });

    var queryString = location.href.split('?');
    var queryStringParts = queryString[1].split('=');
    var userId = parseInt(queryStringParts[1]);

    $.ajax({
        method: 'POST',
        url: '/get-user-post-info',
        data: {
            user_id: userId
        },
        success: function(resp) {
            $('#total-posts').html(resp.total_posts);
            $('#total-applied-to').html(resp.total_app);
        }
    });
});