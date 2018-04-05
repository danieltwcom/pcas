$(document).ready(function() {
    $('.accept-applicant').on('submit', function(e) {
        e.preventDefault();

        var form = $(this);
        
        alertify
        .okBtn('Proceed')
        .cancelBtn('Cancel')
        .confirm('Please be certain you really want to accept this applicant.', function(e) {
            acceptApplicant(form);
        }, function(e) {
            return false;
        });
    });

    $('.application-upvote').on('submit', function(e) {
        e.preventDefault();

        var form = $(this);

        alertify
        .okBtn('Yes')
        .cancelBtn('No')
        .confirm('Do you want to upvote this user?', function(e) {
            upvote(form);
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