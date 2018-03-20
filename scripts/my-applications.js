$(document).ready(function() {
    $('.application-complete').on('submit', function(e) {
        e.preventDefault();

        var form = $(this);

        alertify
        .okBtn('Yes')
        .cancelBtn('No')
        .confirm('Are you sure the job is complete?<br><small>You cannot revert this change</small>', function(e) {
            $.ajax({
                method: 'POST',
                url: '/application/complete',
                data: form.serialize(),
                success: function(resp) {
                    if (resp.status === 'success') {
                        $(form).removeClass('application-complete').addClass('application-upvote').find('.application-status').removeClass('badge-primary').addClass('badge-success').html('Complete');
                        $(form).attr({'action': '/application/upvote'});
                        $(form).find('input[type=submit]').removeClass('btn-primary').addClass('btn-info').attr('value', 'Upvote User');
                        $(form).off('submit');
                        $(form).on('submit', function(e) {
                            e.preventDefault();

                            var form = $(this);

                            alertify
                            .okBtn('Yes')
                            .cancelBtn('No')
                            .confirm('Do you want to upvote this employer?', function(e) {
                                $.ajax({
                                    method: 'POST',
                                    url: '/application/upvote',
                                    data: form.serialize(),
                                    success: function(resp) {
                                        console.log(resp);
                                        if (resp.status === 'voted') {
                                            alertify.alert('You can only vote once per completed job.');
                                        } else if (resp.status === 'incomplete') {
                                            alertify.alert('You must complete the job first before upvoting.');
                                        } else if (resp.status === 'success') {
                                            alertify.alert('Upvoted.');
                                            $(form).find('input').remove();
                                        }
                                    }
                                });
                            }, function(e) {
                                return false;
                            });
                        });
                    } else if (resp.status === 'fail') {
                        alertify.alert('An error occurred');
                    } else if (resp.status ==='unavailable') {
                        alertify.alert('The job posting is still searching for applicants.');
                    }
                }
            });
        }, function(e) {
            return false;
        });
    });

    $('.application-withdraw').on('submit', function(e) {
        e.preventDefault();

        var form = $(this);

        alertify
        .okBtn('Yes')
        .cancelBtn('No')
        .confirm('Are you sure you want to withdraw from this application?', function(e) {
            $.ajax({
                method: 'POST',
                url: '/application/withdraw',
                data: form.serialize(),
                success: function(resp) {
                    $('#application-' + resp.id).remove();
                }
            });
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
        .confirm('Do you want to upvote this employer?', function(e) {
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
});