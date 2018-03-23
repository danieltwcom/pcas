$(document).ready(function() {
    window.onload = function() {
        var title = this.localStorage.getItem('title');
        if (title !== null) {
            $('input[name=title]').val(title);
        }

        var when = this.localStorage.getItem('when');
        if (title !== null) {
            $('input[name=when]').val(when);
        }

        var school = this.localStorage.getItem('school');
        if (school !== null) {
            $('input[name=school]').val(school);
        }

        var courseNumber = this.localStorage.getItem('course_number');
        if (courseNumber !== null) {
            $('input[name=course_number]').val(courseNumber);
        }

        var time = this.localStorage.getItem('time');
        if (time !== null) {
            $('input[name=time]').val(time);
        }

        var details = this.localStorage.getItem('details');
        console.log(details);
        if (details !== null) {
            $('textarea[name=details]').val(details);
        }

        var type = this.localStorage.getItem('type');
        console.log(type);
        if (type !== null) {
            $('select[name=type]').val(type);
        }

        var lookingForInterpreter = this.localStorage.getItem('looking_for_interpreter');
        if (lookingForInterpreter !== null) {
            $('input[name=looking_for_interpreter]').prop('checked', true);
        }

        var howManyInterpreter = this.localStorage.getItem('how_many_int');
        if (howManyInterpreter !== null) {
            $('input[name=how_many_int]').val(howManyInterpreter);
        }

        var lookingForTranscriber = this.localStorage.getItem('looking_for_transcriber');
        if (lookingForTranscriber !== null) {
            $('input[name=looking_for_transcriber]').prop('checked', true);
        }

        var howManyTranscriber = this.localStorage.getItem('how_many_tra');
        if (howManyTranscriber !== null) {
            $('input[name=how_many_tra]').val(howManyTranscriber);
        }

        var isScreened = this.localStorage.getItem('is_screened');
        if (isScreened !== null) {
            $('input[name=is_screened]').prop('checked', true);
        }

        var isVerified = this.localStorage.getItem('is_verified');
        if (isVerified !== null) {
            $('input[name=is_verified]').prop('checked', true);
        }

        var hideEmail = this.localStorage.getItem('hide_email');
        console.log(hideEmail);
        if (hideEmail !== null) {
            $('input[name=hide_email]').prop('checked', true);
        }

        var hidePhone = this.localStorage.getItem('hide_phone');
        if (hidePhone !== null) {
            $('input[name=hide_phone]').prop('checked', true);
        }
    }

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

        if (isNaN(parseInt($('input[name=how_many_tra]').val()) + parseInt($('input[name=how_many_int]').val()))) {
            alertify.alert('wrong');
        } else {
            $.ajax({
                method: 'POST',
                url: '/new-post',
                data: $(this).serialize(),
                success: function(resp) {
                    if (resp.status === 'success') {
                        localStorage.clear();
                        location.href = '/post-created';
                    } else if (resp.status === 'fail') {
                        alert('an error occurred');
                        window.onbeforeunload = function() {
                            localStorage.setItem('title', $('input[name=title]').val());
                            localStorage.setItem('when', $('input[name=when]').val());
                            localStorage.setItem('school', $('input[name=school]').val());
                            localStorage.setItem('course_number', $('input[name=course_number]').val());
                            localStorage.setItem('time', $('input[name=time]').val());
                            localStorage.setItem('details', $('textarea[name=details]').val());
                            localStorage.setItem('type', $('select[name=type]').val());
                            localStorage.setItem('looking_for_interpreter', $('input[name=looking_for_interpreter]').val());
                            localStorage.setItem('how_many_int', $('input[name=how_many_int]').val());
                            localStorage.setItem('how_many_tra', $('input[name=how_many_tra]').val());
                            localStorage.setItem('is_screened', $('input[name=is_screened]').val());
                            localStorage.setItem('is_verified', $('input[name=is_verified]').val());
                            localStorage.setItem('hide_email', $('input[name=hide_email]').val());
                            localStorage.setItem('hide_phone', $('input[name=hide_phone]').val());
                        }
                    }
                }
            });
        }
    });
});