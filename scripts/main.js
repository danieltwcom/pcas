$(document).ready(function() {
    $('[data-toggle=tooltip]').tooltip();
    
    alertify.parent(document.body);

    $.ajax({
        method: 'GET',
        url: '/get-schools',
        success: function(resp) {
            for (school of resp) {
                $('#schools').append(
                    $('<option>').attr('value', school.name).html(school.name)
                );
            }

            $('#schools').append(
                $('<option>').attr('value', 'Other').html('Other')
            )
        }
    });
});