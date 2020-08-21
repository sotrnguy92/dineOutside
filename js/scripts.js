$(document).ready(function() {
// image of magnifying glass that you can use as search button
$searchButton = $(".searchButton");

// container that will hold list of search history
$searchHistory = $(".searchHistory");
$userList = $('.userList'); // this is a UL element. append $("<li>") search results here
// dynamically generate search history list here in list items
// append all li this container: $searchHistory.append($userList);


// input field asking for type of food or restaurant
$typeOfFood = $(".typeOfFood");

// input field asking for city or zip code
$location = $(".location");

// weather will be generated in this container, top right column on page
$weather = $(".weather");

// AQI will be generated in this container, botton right column on page
$todayAQI = $(".todayAQI");

// parent container on center of page for returned restaurants
$returnedRestaurants = $(".returnedRestaurants");

// dynamically generate search results in this container
$restaurantInfo = $("<div>").addClass("col-11 restaurantInfo");
// append in this container: $returnedRestaurants.append($restaurantInfo);



// AQI widget; to get local AQI, this needs coordinates
airQualityIndex();
function airQualityIndex() {
  let latitude = 37.7749;
  let longitude = -122.4194;
  // citySearch is the input value or from localStorage; declare variable for this
  citySearch = "San Francisco";
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
      let AQI = response.data.aqi;

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
        $todayAQI.append(localTimeDisplay, aqiStation, aqiLocal);

        let $aqiRow = $("<p>").addClass("row m-3 aqiKey");

        let good = $("<div>")
          .addClass("col-12 p-2")
          .text("0-50 good")
          .css("background-color", "green");
        good.css("color", "white");
        let moderate = $("<div>")
          .addClass("col-12 p-2")
          .text("51-100 moderate")
          .css("background-color", "yellow");
        let sensitive = $("<div>")
          .addClass("col-12 p-2")
          .text("101-150 unhealthy for sensitive groups")
          .css("background-color", "orange");
        let unhealthy = $("<div>")
          .addClass("col-12 p-2")
          .text("151-200 unhealthy")
          .css("background-color", "red");
        unhealthy.css("color", "white");
        let veryUnhealthy = $("<div>")
          .addClass("col-12 p-2")
          .text("201-300 very unhealthy")
          .css("background-color", "blueviolet");
        veryUnhealthy.css("color", "white");
        let hazardous = $("<div>")
          .addClass("col-12 p-2")
          .text("301+ hazardous")
          .css("background-color", "maroon");
        hazardous.css("color", "white");

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