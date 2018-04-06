$(document).ready(function() {
    $.ajax({
        method: 'POST',
        url: '/get-message-count',
        data: {
            username: username
        },
        success: function(resp) {
            console.log(resp);
            let messageCount = parseInt(resp.message_count);

            if (messageCount > 0) {
                $('#message-notification').html(messageCount + ' new');
                $('#dropdown-message-link').append(
                    $('<span>').addClass('badge badge-success ml-1').html(messageCount + ' new')
                )
            }
        }
    });

    /* $.ajax({
        method: 'POST',
        url: '/get-upvotes',
        data: {
            username: username
        },
        success: function(resp) {
            console.log(resp);
            $('#user-panel-upvotes').html('+' + resp.upvotes);
        }
    }); */
});