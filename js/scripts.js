$(document).ready(function () {
  // image of magnifying glass that you can use as search button
  const $searchButton = $(".searchButton");

  // container that will hold list of search history
  const $searchHistory = $(".searchHistory");
  const $userList = $(".userList"); // this is a UL element. append $("<li>") search results here
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

  let cityCount = 0;

  // you can empty this out every time the user searches for a new city
  const $localAQI = $(".localAQI");

  // parent container on center of page for returned restaurants
  const $returnedRestaurants = $(".returnedRestaurants");

  // dynamically generate search results in this container
  const $restaurantInfo = $("<div>").addClass("col-11 restaurantInfo");
  // append in this container: $returnedRestaurants.append($restaurantInfo);

  let pastSearchArr = [];

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

      for (let i = 0; i < response.restaurants.length; i++) {
        const restName = response.restaurants[i].restaurant.name;
        const restFeaturedImage =
          response.restaurants[i].restaurant.featured_image;
        const restOpenTime = response.restaurants[i].restaurant.timings;
        const restLat = response.restaurants[i].restaurant.location.latitude;
        const restLong = response.restaurants[i].restaurant.location.longitude;
        const restAddress = response.restaurants[i].restaurant.location.address;
        const outdoorSeating = function () {
          if (
            response.restaurants[i].restaurant.highlights.includes(
              "Outdoor Seating"
            ) === true
          ) {
            return "Outdoor Seating";
          } else {
            return "Indoor Seating Only";
          }
        };

        const $restResult = `
        <div class="row d-flex justify-content-center">
        <div class="col-11 restaurantInfo" data-toggle="modal" data-target="#business-venue-modal" data-index="0">
          <p class="resName">restaurant name: ${restName}</p>
          <p class="foodType">type of food: ${foodSearch}</p>
          <p class="outdoor">outdoor seating? ${outdoorSeating()}</p>
        </div>
      </div>`;
        $(".returnedRestaurants").append($restResult);

        // append necessary info in HTML format. Consider how many rest results we want to show
        // set values = necessary HTML elements
      }
      airQualityIndex(restLat, restLong, cityID);
    });
  }
  // for testing - calls the query search; would normally happen on line 57
  // callCityIDSearch(citySearch,foodSearch) // to comment out
  // need to add submit button on HTML. need to add LocVal input as well
  $searchButton.on("click", function (event) {
    event.preventDefault();
    let citySearch = $location.val(); // set dataCitySearch object query value to the value submitted
    let foodSearch = $typeOfFood.val();

    pastSearchArr.push({ food: foodSearch, city: citySearch });
    $typeOfFood.val("");
    $location.val(""); // resets search text after search

    localStorage.setItem("city", citySearch); // store searched item to LS to add back in later
    localStorage.setItem("search", foodSearch);
    callCityIDSearch(citySearch, foodSearch); // call function passing along both variables
    appendSearch(citySearch, foodSearch);
    latLongPull(citySearch);
  });

  // function to append to left aside
  function appendSearch(citySearch, foodSearch) {
    if (cityCount > 9) {
      alert(
        "Can only hold 10 searches. Please refresh the paage to add new ones"
      );
      return;
    } else {
      let $city = $("<li>");
      $city.text(`${citySearch}: ${foodSearch}`).addClass("userResults");
      $city.attr("id", `${citySearch}:${foodSearch}`);
      $(".userList").append($city);
      cityCount++;
      // searchHistory.push(location.toLowerCase()) array or object with previous searches to make sure we don't append repeat searches
    }
  }

  function airQualityIndex(latitude, longitude, city) {
    const citySearch = city;
    let aqiURL =
      "https://api.waqi.info/feed/geo:" +
      latitude +
      ";" +
      longitude +
      "/?token=8323d177d676bcf5b5562025b17328fc56a804df";

    $.ajax({
      url: aqiURL,
      method: "GET",
    }).then(function (response) {
      console.log(response);
      let AQI = response.data.aqi;
      $localAQI.text(`${AQI}`);

      if (AQI == undefined) {
        $localAQI.text(`AQI: unknown for this location`);
      } else {
        if (AQI <= 50) {
          $localAQI.css("background-color", "green");
          $localAQI.css("color", "white");
        } else if (AQI <= 100) {
          $localAQI.css("background-color", "yellow");
          $localAQI.css("color", "black");
        } else if (AQI <= 150) {
          $localAQI.css("background-color", "orange");
        } else if (AQI <= 200) {
          $localAQI.css("background-color", "red");
          $localAQI.css("color", "white");
        } else if (AQI <= 300) {
          $localAQI.css("background-color", "blueviolet");
          $localAQI.css("color", "white");
        } else {
          $localAQI.css("background-color", "maroon");
          $localAQI.css("color", "white");
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
      console.log(response);
      // updates current info section with relevent data
      let curTemp = Math.round(tempConversion(response.current.temp));
      $(".temperature").text(curTemp + "ºF");
      // converts windspeed from m/s to mph
      let UVI = response.current.uvi;
      $(".description").text(`UVI: ${UVI}`);
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
      $(".date").text(displayDate);
      console.log(displayDate);
      let iconVal = response.current.weather[0].icon;
      $("#icon").attr("src", `http://openweathermap.org/img/wn/${iconVal}.png`);
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
      $(".description").css("background-color", "red");
    } else if (UVI < 4) {
      $(".description").css("background-color", "green");
    } else {
      $(".description").css("background-color", "orange");
    }
  }
});
