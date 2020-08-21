$(document).ready(function () {
  let URL =
    "https://developers.zomato.com/api/v2.1/cities?q=san%20jose?api-key=beddad251d06b8803b32610b0bf44218";

  $.ajax({
    url: URL,
    method: "GET",
  }).then(function (response) {
    console.log(response);
  });

  const urlCitySearch = "https://developers.zomato.com/api/v2.1/locations";
  const urlCityLookup = "https://developers.zomato.com/api/v2.1/search";
  const dataCitySearch = {
    query: "concord",
  };
  // this is the ajax call, requires the api key in the header
  function callAjax(data) {
    $.ajax({
      url: urlCitySearch,
      method: "GET",
      headers: {
        "user-key": "beddad251d06b8803b32610b0bf44218",
      },
      data: data,
    }).then(function (response) {
      console.log(response);
    });
  }

//calling the ajax function
  callAjax(dataCitySearch);

//   function for looking up the city
  function callAjaxCityLookup(city) {
    const data = {
      q: "ramen",
      entity_type: "city",
      entity_id: city,
    };
    $.ajax({
      url: urlCityLookup,
      method: "GET",
      headers: {
        "user-key": "beddad251d06b8803b32610b0bf44218",
      },
      data: data,
    }).then(function (response) {
      console.log(response);
    });
  }

//   another ajax call to set the city id and call the city ajax
  function callAjax(data) {
    $.ajax({
      url: urlCitySearch,
      method: "GET",
      headers: {
        "user-key": "beddad251d06b8803b32610b0bf44218",
      },
      data: data,
    }).then(function (response) {
      const city_id = response.location_suggestions[0].city_id;
      callAjaxCityLookup(city_id);
    });
  }
  callAjax(dataCitySearch);
});
