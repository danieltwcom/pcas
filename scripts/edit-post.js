$(document).ready(function() {
    var UrlParams = new URLSearchParams(window.location.search);
    var postId = UrlParams.get('post_id');

    $.ajax({
        method: 'GET',
        url: '/select-school?post_id=' + postId,
        success: function(resp) {
            $('#schools').val(resp);
        }
    });

    $('.edit-post').on('submit', function(e) {
        e.preventDefault();

        $.ajax({
            method: 'POST',
            url: '/submit-edit-post',
            data: $(this).serialize(),
            success: function(resp) {
                if (resp.status === 'success') {
                    alertify.alert('Post successfully edited. Redirecting in 3 sec');
                    if(resp.role == "admin"){
                        setTimeout(function() { location.href = '/admin-panel'}, 3000);
                    }else{
                        setTimeout(function() { location.href = '/my-posts'}, 3000);
                    }
                }
            }
        });
    });
});