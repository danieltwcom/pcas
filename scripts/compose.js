$(document).ready(function() {
    $('.send-message').on('submit', function(e) {
        e.preventDefault();

        var form = $(this);

        if (!$.trim($("#message").val())) {
            alertify.alert('You cannot send a blank message.');
        } else {
            $.ajax({
                method: 'POST',
                url: '/send-message',
                data: form.serialize(),
                success: function(resp) {
                    if (resp.status === 'fail') {
                        alertify.alert('An error occurred.');
                    } else if (resp.status === 'success') {
                        location.href = '/sent';
                    }
                }
            });
        }
    });
});