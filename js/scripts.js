$(document).ready(function () {
  // image of magnifying glass that you can use as search button
  $searchButton = $(".searchButton");

  // input field asking for type of food or restaurant
  $typeOfFood = $(".typeOfFood");

  // input field asking for city or zip code
  $location = $(".location");

  // section that will show AQI
  $todayAQI = $(".todayAQI");

  const urlCitySearch = 'https://developers.zomato.com/api/v2.1/locations'
  const urlCityLookup = 'https://developers.zomato.com/api/v2.1/search'
  let foodSearch = 'ramen' // to comment out
  let citySearch = 'los angeles' // to comment out
  // const dataCitySearch = {
  //                         'query': citySearch
  //                         }
  let cityCount = 0;


  function callCityIDSearch(city,foodSearch) {
      $.ajax({
          url: urlCitySearch,
          method: "GET",
          headers: {
              'user-key': 'beddad251d06b8803b32610b0bf44218'
          },
          data: {
              'query': city
          }
      }).then(function (response) {
          const city_id = response.location_suggestions[0].city_id;
          console.log(response);
          callAjaxRestLookup(city_id, foodSearch);
      })
  };
  function callAjaxRestLookup(city,foodSearch) {
      const data = {
          'q': foodSearch, 
          'entity_type': 'city',
          'entity_id': city,
      };
      $.ajax({
          url: urlCityLookup,
          method: "GET",
          headers: {
              'user-key': 'beddad251d06b8803b32610b0bf44218'
          },
          data: data
      }).then(function (response) { 
          console.log(response) 
          console.log(response.restaurants[0].restaurant)
          for(let i=0;i<response.restaurants.length;i++){
            restName = response.restaurants[i].restaurant.name
            restFeaturedImage = response.restaurants[i].restaurant.featured_image
            restOpenTime = response.restaurants[i].restaurant.timings
            restLat = response.restaurants[i].restaurant.location.latitude
            restLong = response.restaurants[i].restaurant.location.longitude
            restAdress = response.restaurants[i].restaurant.location.address
            console.log(restName, restFeaturedImage, restOpenTime, restLat, restLong)
            // append necessary info in HTML format. Consider how many rest results we want to show
            // set values = necessary HTML elements
          }
          airQualityIndex(restLat,restLong,city);
      });
  }
// for testing - calls the query search; would normally happen on line 57
// callCityIDSearch(citySearch,foodSearch) // to comment out
  // need to add submit button on HTML. need to add LocVal input as well
  $searchButton.on("click", function (event) {
      event.preventDefault(); 
      citySearch = $location.val() // set dataCitySearch object query value to the value submitted
      $location.text('') // resets search text after search
      foodSearch = $typeOfFood.val()
      localStorage.setItem('city', citySearch); // store searched item to LS to add back in later
      localStorage.setItem('search', foodSearch);
      callCityIDSearch(citySearch,foodSearch) // call function passing along both variables 
      appendSearch(citySearch,foodSearch)
  }); 

  // function to append to left aside
  function appendSearch(citySearch,foodSearch){
    if(cityCount > 11){
        alert("Can only hold 10 searches. Please refresh the paage to add new ones")
    } else {
      $city = $('<li>')
      $city.text(`${citySearch}: ${foodSearch}`).addClass('userResults')
      $city.attr('id',`${citySearch}:${foodSearch}`)
      $('.previousSearches').append($city)
      cityCount++
      // searchHistory.push(location.toLowerCase()) array or object with previous searches to make sure we don't append repeat searches
    }
  }


  // AQI widget; to get local AQI, this needs coordinates
  // let lat = 37.7749;
  // let long = -122.4194;
  // airQualityIndex(lat,long);
  function airQualityIndex(latitude,longitude, city) {
    // let latitude = 37.7749;
    // let longitude = -122.4194;
    // citySearch is the input value or from localStorage; declare variable for this
    citySearch = city;
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
      console.log(response)
      $todayAQI.html('')
      let AQI = response.data.aqi;

      // lets hard code a lot of this. most of it doesn't change... 
      let aqiHeader = $("<p>").addClass("aqiHeader").text("Air Quality Index");
      $todayAQI.append(aqiHeader);

      let aqiLocal = $("<p>")
        .addClass("col-sm-7 aqiLocal")
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