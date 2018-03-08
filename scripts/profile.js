$(document).ready(function() {
    $('#edit-profile-button').on('click', function() {
        location.href = '/edit-profile';
    });

    // deletes the credential from the user profile
    $(document).on('submit', 'form.delete-credential', function(e) {
        e.preventDefault();

        $(this).remove();
    });

    $('.custom-file-input').on('change', function() {
        let filepath = $(this).val();
        let lastSlash = filepath.lastIndexOf('\\');
        let filename = filepath.slice(lastSlash + 1);

        $('#upload-filename').html(filename)
    });

    $('#upload-profile-pic-button').on('click', function() {
        $('#profile-pic-input').click();
    });

    $('#profile-pic-input').on('change', function() {
        $('#upload-profile-pic').submit();
    });
});