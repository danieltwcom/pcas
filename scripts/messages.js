$(document).ready(function() {
    $('#compose').on('click', function() {
        location.href='/compose';
    });



    
    let clicked;

    $('.mark-as-read-button').on('click', function() {
        clicked = $(this).attr('name');
    });

    $(document).on('submit', 'form.message-form', function(e) {
        if(clicked === 'read') {
            e.preventDefault();
            
            $(this).closest('tr').removeClass('font-weight-bold');
        } else {
            e.preventDefault();

            $(this).closest('tr').remove();
        }
        
    });
});