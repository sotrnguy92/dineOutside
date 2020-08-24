// $(document).ready(function () {
// VARIABLES 
// image of magnifying glass that you can use as search button
const $searchForm = $("form");
// this is a UL element. append $("<li>") search results here
const $userList = $(".userList");
// dynamically generate search history list here in list items
// append all li this container: $searchHistory.append($userList);
const $searchResult = $(".search-result");
// input field asking for type of food or restaurant
const $typeOfFood = $(".typeOfFood");
// input field asking for city or zip code
const $location = $(".location");
// place weather values in here
const $description = $(".description");
const $icon = $(".icon");
const $temperature = $(".temperature");
// weather widget API key
const weatherAPIKey = "78d4820b52a05a5e039fd595437c5ac0";
// URLs for Zomato AJAX requests
const urlLocationSearch = "https://developers.zomato.com/api/v2.1/locations";
const urlQuerySearch = "https://developers.zomato.com/api/v2.1/search";
const urlRestSearch = "https://developers.zomato.com/api/v2.1/restaurant";
// Variable to help moderate number of results
let cityCount = 0;
// you can empty this out every time the user searches for a new city. For adding contents to the AQI function
const $localAQI = $(".localAQI");
// parent container on center of page for returned restaurants
const $returnedRestaurants = $(".returnedRestaurants");
// display current local time
const $today = $(".today");

// history item li
const $historyItem = $('.history-item');
const $historyList = $('#history-list');

const history = [];
const historyLocalKey = "dine-outside-history";

let today = moment().format("ddd, MMM DD, YYYY");

// display current local time
$today.text("TODAY: " + today);

// FUNCTIONS
// sets the city count to the local storage value
function setCount() {
  if (parseInt(localStorage.getItem("cityCount"))) {
    cityCount = parseInt(localStorage.getItem("cityCount"));
  }
}

// call setCount
setCount();

// Comment on function
function loadSavedSearches() {
  for (let i = 1; i < parseInt(localStorage.getItem('cityCount')) + 1; i++) {
    let $city = $("<li>");
    let cityName = localStorage.getItem('city' + i)
    let foodName = localStorage.getItem('food' + i)
    $city.text(`${cityName}: ${foodName}`).addClass("userResults");
    $city.attr("data-city-id", cityName);
    $city.attr("data-food-id", foodName);
    $userList.append($city);
  }
}

// call loadSavedSearches
loadSavedSearches();

// Funciton is called when the submit button is clicked or when a historical search is clicked. Takes in the searched city and food item. Runs Zomato API request and pulls the city ID. Then calls the AJAX Restaurant Lookup function, passing along the ID, and the food type that was searched.
function callCityIDSearch(city, foodSearch) {
  $.ajax({
    url: urlLocationSearch,
    method: "GET",
    headers: {
      "user-key": "beddad251d06b8803b32610b0bf44218",
    },
    data: {
      query: city,
    },
  }).then(function (response) {
    const city_id = response.location_suggestions[0].entity_id;
    //I think we might want to display the city and state as well so that the user can confirm that we are in the right location
    const city_name = response.location_suggestions[0].title;
    callAjaxRestLookup(city_id, foodSearch);
  });
}

// Function is called in the callCityIDSearch function. Takes in the cityID number and the food that was searched. Runs a different Zomato API request and pulls the lat/long saved as variables. It also pulls the first 10 restaurants that meet the search criteria, and displays key content on the middle section (returnedRestaurants) portion of the page. 
function callAjaxRestLookup(cityID, foodSearch) {
  const data = {
    q: foodSearch,
    entity_type: "city",
    entity_id: cityID,
  };
  $.ajax({
    url: urlQuerySearch,
    method: "GET",
    headers: {
      "user-key": "beddad251d06b8803b32610b0bf44218",
    },
    data: data,
  }).then(function (response) {
    const restLat = response.restaurants[0].restaurant.location.latitude;
    const restLong = response.restaurants[0].restaurant.location.longitude;

    $returnedRestaurants.html(""); // clear previous results
    // limited to 10 results
    for (let i = 0; i < 10; i++) {
      const restName = response.restaurants[i].restaurant.name;
      const outdoorSeating = function () {
        if (response.restaurants[i].restaurant.highlights.includes("Outdoor Seating") === true) {
          return "yes";
        } else {
          return "no";
        }
      };
      // clones result layout and make it visible then fill in the necessary details then append it to .returnedRestaurant class element
      const newSearchResult = $searchResult.clone();
      newSearchResult.removeAttr("hidden").addClass("d-flex");
      newSearchResult.children().find(".resName").text(restName);
      newSearchResult.children().find(".foodType").text(foodSearch);
      newSearchResult.children().find(".outdoor").text(outdoorSeating());
      newSearchResult
        .find(".restaurantInfo")
        .attr("data-index", response.restaurants[i].restaurant.id);
      $returnedRestaurants.append(newSearchResult);
    }
  });
}

// brings up modal info. clears and updaes
$("#business-venue-modal").on("shown.bs.modal", function (event) {
  restID = $(event.relatedTarget).attr("data-index");

  const data = {
    res_id: restID,
  };

  // clear modal values
  $(".venue-image-display").attr(
    "src",
    "https://via.placeholder.com/500x500"
  );
  $("#business-venue-name").text("");
  $("#about").text("");
  $("#venueOpening").text("");
  $("#venueAddress").text("");
  $("#venueContactInfo").text("");
  $("#venueCuisine").text("");
  $("#venueDelivery").text("");
  $("#venueReviews").text("");
  $("#restaurantLink").attr("href", "#");

  $.ajax({
    url: urlRestSearch,
    method: "GET",
    headers: {
      "user-key": "beddad251d06b8803b32610b0bf44218",
    },
    data: data,
  }).then(function (response) {
    let highlights = "";
    response.highlights.forEach((element) => {
      highlights += `${element}, `;
    });

    // update modal values
    $(".venue-image-display").attr(
      "src",
      response.featured_image.replace('"', "")
    );
    $("#business-venue-name").text(response.name);
    $("#about").text(highlights.slice(0, -2));
    $("#venueOpening").text(response.timings);
    $("#venueAddress").text(response.location.address);
    $("#venueContactInfo").text(response.phone_numbers);
    $("#venueCuisine").text(response.cuisines);
    $("#venueDelivery").text(response.is_delivering_now ? "Yes" : "No");
    $("#venueReviews").text(response.user_rating.rating_text);
    $("#restaurantLink").attr("href", response.url);


  });
});


// $(document).on("click", ".userResults", function (event) {
//   cityName = event.target.getAttribute("data-city-id");
//   foodName = event.target.getAttribute("data-food-id");

//   callCityIDSearch(cityName, foodName); // call function passing along both variables
//   latLongPull(cityName);
// });

$('#history-list').on('click', function (e) {
  if (e.target.matches('.history-item')) {
    cityName = event.target.getAttribute("data-city-id");
    foodName = event.target.getAttribute("data-food-id");

    callCityIDSearch(cityName, foodName); // call function passing along both variables
    latLongPull(cityName);
  }
});

function airQualityIndex(lat, long) {
  $localAQI.empty();
  let aqiURL =
    "https://api.waqi.info/feed/geo:" +
    lat +
    ";" +
    long +
    "/?token=8323d177d676bcf5b5562025b17328fc56a804df";

  $.ajax({
    url: aqiURL,
    method: "GET",
  }).then(function (response) {
    let AQI = response.data.aqi;
    let $displayAQI = $("<div>").addClass("displayAQI").text(AQI);
    let $station = $("<div>").text("Closest station: " + response.data.city.name);
    $localAQI.append($displayAQI, $station);

    if (!AQI) {
      let $station = $("<div>").text(`AQI: unknown for this location`);
      $localAQI.append($station);
    } else {
      if (AQI <= 50) {
        $displayAQI.css("background-color", "green");
        $displayAQI.css("color", "white");
      } else if (AQI <= 100) {
        $displayAQI.css("background-color", "yellow");
        $displayAQI.css("color", "black");
      } else if (AQI <= 150) {
        $displayAQI.css("background-color", "orange");
      } else if (AQI <= 200) {
        $displayAQI.css("background-color", "red");
        $displayAQI.css("color", "white");
      } else if (AQI <= 300) {
        $displayAQI.css("background-color", "blueviolet");
        $displayAQI.css("color", "white");
      } else {
        $displayAQI.css("background-color", "maroon");
        $displayAQI.css("color", "white");
      }
    }
  });
}

// function called when submit is clicked. Takes in the city searched and the food that was searched, and appends the search to left aside
function appendSearch(citySearch, foodSearch) {

  const $newHistoryItem = $historyItem.clone();

  $newHistoryItem.text(`${foodSearch} in ${citySearch}`);
  $newHistoryItem.removeAttr('hidden');
  $newHistoryItem.attr('data-city-id', citySearch);
  $newHistoryItem.attr('data-food-id', foodSearch);
  $historyList.prepend($newHistoryItem);

  if ($historyList.children().length - 1 >= 10){
    $historyList.children().last().remove();
  }

  appendToLocalStorage({ city: citySearch, foodSearch });
}

function appendToLocalStorage(data) {

  if (history.length >= 10 ){
    history.shift();
  }

  history.push(data);
  localStorage.setItem(historyLocalKey, JSON.stringify(history));
  console.log(localStorage.getItem(historyLocalKey));
}

// Function is called when the search button is clicked, or a historical search is clicked. takes the location requested and runs an ajax request pulling the lat and long of the city. Then calls the weatherSearch function passing along lat and long. 
function latLongPull(location) {
  // Here we are building the URL we need to query the database
  let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${weatherAPIKey}`;
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    $(".city").text(response.name);
    let lat = response.coord.lat;
    let long = response.coord.lon;
    weatherSearch(lat, long);
    airQualityIndex(lat, long);
  });
}

// Called in the latLongPull function, takes in the lat and long values and pulls most of the relavent data we need to update
function weatherSearch(lat, long) {
  // Here we are building the URL we need to query the database
  let queryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&appid=${weatherAPIKey}`;
  // We then created an AJAX call
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    console.log("object below has weather info");
    console.log(response);
    // updates current info section with relevent data
    $description.text(response.daily[0].weather[0].description);
    let curTemp = Math.round(tempConversion(response.current.temp));
    $temperature.text(curTemp + "ºF");
    // converts windspeed from m/s to mph
    let UVI = Math.round(response.current.uvi);
    $(".UVI").text(`UVI: ${UVI}`);
    uviBackgroundSet(UVI);
    // retrieves the current and timezone offset value in Unix UTC
    // use the Date object and toUTCString method to convert the time
    // multiply by 1000 because Date works in miliseconds.
    // remove the last three characters of the string
    linuxUTC = response.current.dt;
    timeZone = response.timezone_offset;
    let displayDate = new Date(
      linuxUTC * 1000 + timeZone * 1000
    ).toDateString();
    $(".today").text(displayDate);
    let iconVal = response.current.weather[0].icon;

    $(".icon").attr("src", `https://openweathermap.org/img/wn/${iconVal}.png`);

  });
}

// called in the weatherSearch function. Converts the temp from kelvin to F. Takes in a kelvin value and returns the converted value
function tempConversion(temp) {
  let convertedTemp = ((temp - 273.15) * 1.8 + 32).toFixed(2);
  return convertedTemp;
}

// called in the weatherSearch function. Takes in a UVI value and sets the bg color based on the severity
function uviBackgroundSet(UVI) {
  if (UVI > 7) {
    $(".UVI").css("background-color", "red");
  } else if (UVI < 4) {
    $(".UVI").css("background-color", "green");
  } else {
    $(".UVI").css("background-color", "orange");
  }
}

// ON __ EVENTS
// brings up modal info. clears and updates values with an AJAX request
$("#business-venue-modal").on("show.bs.modal", function (event) {
  restID = $(event.relatedTarget).attr("data-index");
  const data = {
    res_id: restID,
  };
  // clear modal values
  $(".venue-image-display").attr(
    "src",
    "https://via.placeholder.com/500x500"
  );
  $("#venueName").text("");
  $("#about").text("");
  $("#venueOpening").text("");
  $("#venueAddress").text("");
  $("#venueContactInfo").text("");
  $("#venueCuisine").text("");
  $("#venueDelivery").text("");
  $("#venueReviews").text("");
  $("#restaurantLink").attr("href", "#");

  $.ajax({
    url: urlRestSearch,
    method: "GET",
    headers: {
      "user-key": "beddad251d06b8803b32610b0bf44218",
    },
    data: data,
  }).then(function (response) {
    console.log(response);
    let highlights = "";
    response.highlights.forEach((element) => {
      highlights += `${element}, `;
    });

    // update modal values
    $(".venue-image-display").attr(
      "src",
      response.featured_image.replace('"', "")
    );
    $("#venueName").text(response.name);
    $("#about").text(highlights.slice(0, -2));
    $("#venueOpening").text(response.timings);
    $("#venueAddress").text(response.location.address);
    $("#venueContactInfo").text(response.phone_numbers);
    $("#venueCuisine").text(response.cuisines);
    $("#venueDelivery").text(response.is_delivering_now ? "Yes" : "No");
    $("#venueReviews").text(response.user_rating.rating_text);
    $("#restaurantLink").attr("href", response.url);
  });
});

// on clicking the submit button, saves the searched values and calls a variety of functions with those variables.
$searchForm.on("submit", function (event) {
  event.preventDefault();
  let citySearch = $.trim($location.val()); // set dataCitySearch object query value to the value submitted
  let foodSearch = $.trim($typeOfFood.val());

  callCityIDSearch(citySearch, foodSearch); // call function passing along both variables
  appendSearch(citySearch, foodSearch);
  latLongPull(citySearch);

  $typeOfFood.val("");
  $location.val(""); // resets search text after search

});

// on clicking a previously saved search, targets the saved city and food ID's and then calls the function to pull that information back up 
$(document).on("click", ".userResults", function (event) {
  console.log(event.target.getAttribute("data-city-id"));
  cityName = event.target.getAttribute("data-city-id");
  console.log(event.target.getAttribute("data-food-id"));
  foodName = event.target.getAttribute("data-food-id");

  callCityIDSearch(cityName, foodName);
  latLongPull(cityName);
});

$historyItem.remove();
// });
