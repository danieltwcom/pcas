require.config({
    paths: {
        "jquery": "jquery-3.3.1.min",
        "bootstrap": "bootstrap.bundle.min",
    },
    shim: {
        "bootstrap": {
            "deps": ["jquery"]
        }
    }
});

define(['jquery', 'functions', 'bootstrap'], function($, f) {
    // when user clicks 'Withdraw'
    function withdraw() {
        // ajax call here and if successful, loading the script below
        
        // remove application from UI
        f.delete_item('form.application-applied');
    }

    // when user clicks 'Complete'
    function complete() {
        $('form.application-in-progress').on('submit', function(e) {
            e.preventDefault();

            // ajax call here and if successful, loading the script below

            // change the submitted form's properties to the rate form's properties
            $(this).attr('action', '/application/rate').removeClass('application-in-progress').addClass('application-rate');
            $(this).find('.application-status').removeClass('badge-warning').addClass('badge-success').text('Completed');
            $(this).find('.application-submit').empty().append(
                $('<input>').addClass('btn btn-sm btn-info').attr({'type': 'submit', 'value': 'Verify'}).tooltip({
                    title: 'Verify the coordinator/interpreter',
                    trigger: 'hover'
                })
            )

            rate();
        });
    }

    // when user clicks the thumbs up
    function rate() {
        $('form.application-rate').on('submit', function(e) {
            e.preventDefault();

            // remove the tooltip created in complete()
            $('.tooltip').remove();
        
            // ajax call here and if successful, loading the script below

            // change the current form's button the 'Verified' and disable it
            $(this).find('.application-submit').empty().append(
                $('<button>').attr('disabled', 'disabled').addClass('btn btn-sm btn-primary').html('Verified')
            )
        });
    }

    return {
        withdraw: withdraw(),
        complete: complete(),
        rate: rate()
    }
});