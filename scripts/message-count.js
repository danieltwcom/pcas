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
                $('#message-notification').append(
                    $('<span>').addClass('badge badge-light ml-1').html(messageCount)
                );
            }
        }
    });
});