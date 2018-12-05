$(document).ready(function () {
    $('.removeBook').click(function (e) {
        var deleteId = $(this).data('id');
        alert(deleteId);
        $.ajax({
            url:'/manage/books/delete/'+deleteId,
            type: 'DELETE',
            success: function () {

            }
        });
        window.location = '/manage/books';
    });

    $('.removeCategory').click(function (e) {
        var deleteId = $(this).data('id');
        alert(deleteId);
        $.ajax({
            url:'/manage/categories/delete/'+deleteId,
            type: 'DELETE',
            success: function () {

            }
        });
        window.location = '/manage/categories';
    });
});
