$(document).ready(function() {
    $('.accept-applicant').on('submit', function(e) {
        e.preventDefault();

        var form = $(this);
        
        alertify
        .okBtn('Proceed')
        .cancelBtn('Cancel')
        .confirm('Please be certain you really want to accept this applicant.', function(e) {
            acceptApplicant(form);
        })
    });

    $('.application-upvote').on('submit', function(e) {
        e.preventDefault();

        var form = $(this);

        alertify
        .okBtn('Yes')
        .cancelBtn('No')
        .confirm('Do you want to upvote this user?', function(e) {
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
        }, function(e) {
            return false;
        });
    });

    $('.revoke-applicant').on('submit', function(e) {
        e.preventDefault();

        var form = $(this);

        alertify
        .okBtn('Yes')
        .cancelBtn('No')
        .confirm('Are you sure you want to revoke this applicant?', function(e) {
            revokeApplicant(form);
        }, function(e) {
            return false;
        });
    });
});