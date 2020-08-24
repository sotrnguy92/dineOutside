// $(document).ready(function () {
const $requiredAlert = $('.required-alert');

$('.search-form').on('submit', function (event) {
    event.preventDefault();
    const $foodInput = $('.typeOfFood')[0].value;
    const $locInput = $('.location')[0].value;

    if (!$foodInput || !$locInput) {
        $requiredAlert.removeAttr('hidden');
        $(event.target).addClass('animated heartBeat fast').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
            $(this).removeClass('animated heartBeat fast');
        });
    } else {
        event.target.submit();
    }

});
// });