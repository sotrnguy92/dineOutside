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

  // rachael will add these in moments format
  const $today = $(".today");
  const $date = $(".date");

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
  const   $restaurantInfo = $("<div>").addClass("col-11 restaurantInfo");
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
      console.log(response);
      //the key for the id is just "id" not "city_id"
      const city_id = response.location_suggestions[0].entity_id;
      console.log(city_id);
      //I think we might want to display the city and state as well so that the user can confirm that we are in the right location
      const city_name = response.location_suggestions[0].title;
      console.log(city_name);
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
      console.log(response);
      for (let i = 0; i < response.restaurants.length; i++) {
        const restName = response.restaurants[i].restaurant.name;
        const restFeaturedImage = response.restaurants[i].restaurant.featured_image;
        const restOpenTime = response.restaurants[i].restaurant.timings;
        const restLat = response.restaurants[i].restaurant.location.latitude;
        const restLong = response.restaurants[i].restaurant.location.longitude;
        const restAddress = response.restaurants[i].restaurant.location.address;
        const outdoorSeating = function(){
          if (response.restaurants[i].restaurant.highlights.includes("Outdoor Seating") === true){
          return "Outdoor Seating";
      }else{
        return "Indoor Seating Only";
      }
    }

        const $restResult = `
        <div class="row d-flex justify-content-center">
        <div class="col-11 restaurantInfo" data-toggle="modal" data-target="#business-venue-modal" data-index="0">
          <p class="resName">restaurant name: ${restName}</p>
          <p class="foodType">type of food: ${foodSearch}</p>
          <p class="outdoor">outdoor seating? ${outdoorSeating()}</p>
        </div>
      </div>`
       $('.returnedRestaurants').append($restResult);

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

    pastSearchArr.push({food: foodSearch, city: citySearch});
    console.log(pastSearchArr);
    $typeOfFood.val("");
    $location.val(""); // resets search text after search
 
    console.log(citySearch);
    console.log(foodSearch);
    localStorage.setItem("city", citySearch); // store searched item to LS to add back in later
    localStorage.setItem("search", foodSearch);
    callCityIDSearch(citySearch, foodSearch); // call function passing along both variables
    appendSearch(citySearch, foodSearch);
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

  // AQI widget; to get local AQI, this needs coordinates
  // let lat = 37.7749;
  // let long = -122.4194;
  // airQualityIndex(lat,long);
  function airQualityIndex(latitude, longitude, city) {
    // let latitude = 37.7749;
    // let longitude = -122.4194;
    // citySearch is the input value or from localStorage; declare variable for this
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
      $todayAQI.html("");
      let AQI = response.data.aqi;

      // lets hard code a lot of this. most of it doesn't change...
      let aqiHeader = $("<p>").addClass("aqiHeader").text("Air Quality Index");
      $todayAQI.append(aqiHeader);
      let aqiLocal = $("<p>")
        .addClass("col-7 aqiLocal")
        .text("Air Quality Index: " + AQI);

      if (AQI == undefined) {
        let aqiUnknown = $("<p>").text(
          "Air Quality Index: unknown for this location"
        );
        $todayAQI.append(aqiUnknown);
      } else {
        let localTime = moment()
          .utcOffset(response.data.time.tz)
          .format("HH:mm");
        let localTimeDisplay = $("<p>").text(
          citySearch + " local time: " + localTime
        );

        let aqiStation = $("<p>").text(
          "Closest station: " + response.data.city.name
        );
        $localAQI.append(localTimeDisplay, aqiStation, aqiLocal);

        if (AQI <= 50) {
          aqiLocal.css("background-color", "green");
          aqiLocal.css("color", "white");
        } else if (AQI <= 100) {
          aqiLocal.css("background-color", "yellow");
        } else if (AQI <= 150) {
          aqiLocal.css("background-color", "orange");
        } else if (AQI <= 200) {
          aqiLocal.css("background-color", "red");
          aqiLocal.css("color", "white");
        } else if (AQI <= 300) {
          aqiLocal.css("background-color", "blueviolet");
          aqiLocal.css("color", "white");
        } else {
          aqiLocal.css("background-color", "maroon");
          aqiLocal.css("background-color", "white");
        }
        $aqiRow.append(
          good,
          moderate,
          sensitive,
          unhealthy,
          veryUnhealthy,
          hazardous
        );
        $todayAQI.append($aqiRow);
      }
    });
  }
});
