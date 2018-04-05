$(document).ready(function() {
    $('input[name=how_many_int]').on('keyup', function() {
        if ($(this).val() > 0) {
            $('input[name=looking_for_interpreter]').prop('checked', true);
        } else if ($(this).val() === '') {
            $('input[name=looking_for_interpreter]').prop('checked', false);
        }
    });

    $('input[name=how_many_tra]').on('keyup', function() {
        if ($(this).val() > 0) {
            $('input[name=looking_for_transcriber]').prop('checked', true);
        } else if ($(this).val() === '') {
            $('input[name=looking_for_transcriber]').prop('checked', false);
        }
    });

    $('#new-post').on('submit', function(e) {
        e.preventDefault();

        var form = $(this);
        var numOfTranscriber = parseInt($('input[name=how_many_tra]').val());
        var numOfInterpreter = parseInt($('input[name=how_many_int]').val());

        if ($('input[name=how_many_tra]').length !== 0 && $('input[name=how_many_int]').length !== 0) {
            if ((isNaN(numOfTranscriber) && isNaN(numOfInterpreter)) || (numOfTranscriber === 0 && numOfInterpreter === 0)) {
                alertify.alert('You need to enter at least 1 interpreter or transcriber');
            } else {
                createPost(form);
            }
        } else {
            createPost(form);
        }
    });
});