$(document).ready(function () {
    let params = new URLSearchParams(location.search);
    const loc = params.get('location')
    const food = params.get('food')
    if (loc && food) {
        callCityIDSearch(loc, food);
        appendSearch(loc, food);
        latLongPull(loc);
    }
});