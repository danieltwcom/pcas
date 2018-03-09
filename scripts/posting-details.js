$(document).ready(function() {
    $('.accept-applicant').on('submit', function(e) {
        e.preventDefault();

        var parent = $(this);

        $.ajax({
            method: 'POST',
            url: '/accept-applicant',
            data: $(this).serialize(),
            success: function(resp) {
                if (resp.status === 'success') {
                    parent.empty();
                    parent.append(
                        $('<button>').addClass('btn btn-sm btn-success disabled').html('Accepted')
                    );
                } else if (resp.status === 'fail') {
                    alertify.alert('An error occurred. Please contact the administrator.');
                }
            }
        });
    });
});