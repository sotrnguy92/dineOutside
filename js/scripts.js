$(document).ready(function () {
  // image of magnifying glass that you can use as search button
  const $searchForm = $("form");

  // container that will hold list of search history
  const $searchHistory = $(".searchHistory");
  const $userList = $(".userList"); // this is a UL element. append $("<li>") search results here
  const $searchResult = $(".search-result");
  // dynamically generate search history list here in list items
  // append all li this container: $searchHistory.append($userList);

  // input field asking for type of food or restaurant
  const $typeOfFood = $(".typeOfFood");

  // input field asking for city or zip code
  const $location = $(".location");

  // weather will be generated in this container, top right column on page
  const $weather = $(".weather");
  // place values in here
  const $cityName = $(".cityName");
  const $description = $(".description");
  const $icon = $(".icon");
  const $temperature = $(".temperature");

  // display current local time
  const $today = $(".today");
  let today = moment().format("ddd, MMM DD, YYYY");
  $today.text("TODAY: " + today);

  // AQI will be generated in this container, botton right column on page
  const $todayAQI = $(".todayAQI");

  const urlLocationSearch = "https://developers.zomato.com/api/v2.1/locations";
  const urlQuerySearch = "https://developers.zomato.com/api/v2.1/search";
  const urlRestSearch = "https://developers.zomato.com/api/v2.1/restaurant";
  let cityCount = 0;

  //sets the city count to the local storage value
  function setCount() {
    if (parseInt(localStorage.getItem("cityCount"))) {
      cityCount = parseInt(localStorage.getItem("cityCount"));
    }
  }

  setCount();

  // you can empty this out every time the user searches for a new city
  const $localAQI = $(".localAQI");

  // parent container on center of page for returned restaurants
  const $returnedRestaurants = $(".returnedRestaurants");

  // dynamically generate search results in this container
  const $restaurantInfo = $("<div>").addClass("col-11 restaurantInfo");
  // append in this container: $returnedRestaurants.append($restaurantInfo);

  function loadSavedSearches(){
    for (let i=1; i< parseInt(localStorage.getItem('cityCount'))+1; i++){
      let $city = $("<li>");
      let cityName = localStorage.getItem('city'+i)
      let foodName = localStorage.getItem('food'+i)
      $city.text(`${cityName}: ${foodName}`).addClass("userResults");
      $city.attr("data-city-id", cityName);
      $city.attr("data-food-id", foodName);
      $(".userList").append($city);
    }
  }

  loadSavedSearches();

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
      //the key for the id is just "id" not "city_id"
      const city_id = response.location_suggestions[0].entity_id;
      //I think we might want to display the city and state as well so that the user can confirm that we are in the right location
      const city_name = response.location_suggestions[0].title;
      callAjaxRestLookup(city_id, foodSearch);
    });
  }

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

      $(".returnedRestaurants").html(""); // clear previous results
      for (let i = 0; i < 10; i++) {
        const restName = response.restaurants[i].restaurant.name;
        const outdoorSeating = function () {
          if (
            response.restaurants[i].restaurant.highlights.includes(
              "Outdoor Seating"
            ) === true
          ) {
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
        $(".returnedRestaurants").append(newSearchResult);
      }
      // airQualityIndex(restLat, restLong);
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

  // for testing - calls the query search; would normally happen on line 57
  // callCityIDSearch(citySearch,foodSearch) // to comment out
  // need to add submit button on HTML. need to add LocVal input as well
  $searchForm.on("submit", function (event) {
    event.preventDefault();
    let citySearch = $.trim($location.val()); // set dataCitySearch object query value to the value submitted
    let foodSearch = $.trim($typeOfFood.val());

    $typeOfFood.val("");
    $location.val(""); // resets search text after search

    callCityIDSearch(citySearch, foodSearch); // call function passing along both variables
    latLongPull(citySearch);
  });

  $(document).on("click", ".userResults", function (event) {
    cityName = event.target.getAttribute("data-city-id");
    foodName = event.target.getAttribute("data-food-id");

    callCityIDSearch(cityName, foodName); // call function passing along both variables
    latLongPull(cityName);
  });

  function airQualityIndex(lat, long) {
    $localAQI.empty();
    console.log("HELLO!" + lat, long);
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
      console.log(response);
      let $displayAQI = $("<div>").addClass("displayAQI").text(AQI);
      let $station = $("<div>").text("Closest station: " + response.data.city.name);
      $localAQI.append($displayAQI, $station);
      $localAQI.append($station);

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

  // weather widget
  const weatherAPIKey = "78d4820b52a05a5e039fd595437c5ac0";

  // takes the location requested and runs an ajax request pulling the lat and long of the city
  // the runs the weatherSearch function taking in the lat and long
  // updates the current city ID on screen
  // checks if the city has been searched before, and if not, runs the appendSearch function
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

  // Takes in the lat and long and pulls most of the relavent data we need to update
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
      $(".temperature").text(curTemp + "ºF");
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

  // converts the temp from kelvin to F. Takes in a kelvin value and returns the converted value
  function tempConversion(temp) {
    let convertedTemp = ((temp - 273.15) * 1.8 + 32).toFixed(2);
    return convertedTemp;
  }

  // takes in a UVI value and sets the bg color based on the severity

  function uviBackgroundSet(UVI) {
    if (UVI > 7) {
      $(".UVI").css("background-color", "red");
    } else if (UVI < 4) {
      $(".UVI").css("background-color", "green");
    } else {
      $(".UVI").css("background-color", "orange");
    }
  }
});
