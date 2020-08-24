$(document).ready(function () {
    const historyLocalKey = "dine-outside-history";

    const $requiredAlert = $('.required-alert');
    const $historyItem = $('.search-history-item');
    const $historyBody = $('.search-history-body');

    function loadSavedSearchesFromLocalStorage() {
        const history = [];
        const localHistory = JSON.parse(localStorage.getItem(historyLocalKey));
        localHistory.forEach(item => {
            let cityName = item.city;
            let foodName = item.food;
            history.push({ city: cityName, food: foodName });
        });
        return history;
    }

    function renderHistoryToPage(history) {
        history.forEach(item => {
            const newHistory = $historyItem.clone();
            newHistory.addClass('d-flex');
            newHistory.removeClass('d-none');
            const td = newHistory.find('td');
            td.text(`${item.food} in ${item.city}`);
            td.attr('data-food', item.food);
            td.attr('data-loc', item.city);
            $historyBody.prepend(newHistory);
        });
    }


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

    $('.search-history-body').on('click', function (e) {
        if (e.target.matches('td')) {
            console.log(e.target);

            const food = $(e.target).attr('data-food');
            const loc = $(e.target).attr('data-loc');

            $('.typeOfFood')[0].value = food;
            $('.location')[0].value = loc;

            $('.search-form').submit();
        }
    });

    renderHistoryToPage(loadSavedSearchesFromLocalStorage());
});