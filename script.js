// Set global variables, including Open Weather Maps API Key
var ownAPI = "a52a1428115d75c15ce2af9c2bcc6b3d";
var currentCity = "";
var lastCity = "";

// New city search button event listener
$('#search-button').on("click", function (event) {
  event.preventDefault();
  currentCity = $('#search-city').val();
  getCurrentConditions(event);
});
  
// Old searched cities buttons event listener
$('#city-results').on("click", function (event) {
  event.preventDefault();
  $('#search-city').val(event.target.textContent);
  currentCity=$('#search-city').val();
  getCurrentConditions(event);
});

// Error handler 
function handleErrors(response) {
  if (!response.ok) {
  return Error(response.statusText);
}
  return response;
}

// Function to get and display the current conditions on Open Weather Maps
function getCurrentConditions(event) {
// Obtain city name from the search box
var city = $('#search-city').val();
currentCity = $('#search-city').val();

// Set the queryURL to fetch from API using weather search 
var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&APPID=${ownAPI}`;
  fetch(queryURL)
  .then(handleErrors)
  .then(function (response) {
  return response.json();
  })
  .then(function (response) {

// Save city to local storage
  saveCity(city);
  $('#search-error').text("");

// Create icon for the current weather using Open Weather Maps
var currentWeatherIcon = "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
// Offset UTC timezone - using moment.js
var currentTimeUTC = response.dt;
var currentTimeZoneOffset = response.timezone;
var currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
var currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);

// Render cities list
renderCities();
// Obtain the 5day forecast for the searched city
getFiveDayForecast(event);
// Set the header text to the found city name
$('#header-text').text(response.name);

// HTML for the results of search
var currentWeatherHTML = `
  <h3>${response.name} ${currentMoment.format("(DD/MM/YY)")}<img src="${currentWeatherIcon}"></h3>
  <ul class="list-unstyled">
      <li>Temperature: ${response.main.temp}&#8451;</li>
      <li>Humidity: ${response.main.humidity}%</li>
      <li>Wind Speed: ${response.wind.speed}kph</li>
      <li id="uvIndex">UV Index:</li>
  </ul>`;

// Append the results to the DOM
  $('#current-weather').html(currentWeatherHTML);

// Get the latitude and longitude for the UV search from Open Weather Maps API
var latitude = response.coord.lat;
var longitude = response.coord.lon;
var uvQueryURL = `api.openweathermap.org/data/2.5/uvi?lat=${latitude}&lon=${longitude}&APPID=${ownAPI}`;

// API solution for Cross-origin resource sharing (CORS) error: https://cors-anywhere.herokuapp.com/
uvQueryURL = `https://cors-anywhere.herokuapp.com/${uvQueryURL}`;

// Fetch the UV information and build the color display for the UV index
  fetch(uvQueryURL)
  .then(handleErrors)
  .then(function (response) {
  return response.json();});
});
}

// Function to obtain the five day forecast and display to HTML
function getFiveDayForecast(event) {
var city = $('#search-city').val();

// Set up URL for API search using forecast search
var queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&APPID=${ownAPI}`;

// Fetch from API
fetch(queryURL)
  .then(handleErrors)
  .then((response) => {
  return response.json();
})
  .then(function (response) {

// HTML template
var fiveDayForecastHTML = `
  <h2>5-Day Forecast:</h2>
  <div id="fiveDayForecastUl" class="d-inline-flex flex-wrap">`;

// Loop over the 5 day forecast and build the template HTML using UTC offset and Open Weather Map icon
for (var i = 0; i < response.list.length; i++) {
    var dayData = response.list[i];
    var dayTimeUTC = dayData.dt;
    var timeZoneOffset = response.city.timezone;
    var timeZoneOffsetHours = timeZoneOffset / 60 / 60;
    var thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
    var iconURL = `https://openweathermap.org/img/w/${dayData.weather[0].icon}.png`;

// Only displaying mid-day forecasts
if (thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss") === "13:00:00") {
    fiveDayForecastHTML += `
        <div class="weather-card card m-2 p0">
           <ul class="list-unstyled p-3">
               <li>${thisMoment.format("DD/MM/YY")}</li>
               <li class="weather-icon"><img src="${iconURL}"></li>
               <li>Temp: ${dayData.main.temp}&#8451;</li>
               <br>
               <li>Humidity: ${dayData.main.humidity}%</li>
           </ul>
        </div>`;
}}

// Append the five-day forecast to the DOM
    $('#five-day-forecast').html(fiveDayForecastHTML);});
}

// Function to save the city to localStorage
function saveCity(newCity) {
  var cityExists = false;

// Check if City exists in local storage
  for (var i = 0; i < localStorage.length; i++) {
    if (localStorage[`cities${i}`] === newCity) {
    cityExists = true;
    break;
}}

// Save to localStorage if city is new
  if (cityExists === false) {
    localStorage.setItem('cities' + localStorage.length, newCity);}
}

// Render the list of searched cities
function renderCities() {
  $('#city-results').empty();
// If localStorage is empty
  if (localStorage.length === 0) {
    if (lastCity) {
      $('#search-city').attr("value", lastCity);
    } else {
      $('#search-city').attr("value", "");
    }
  } else {
// Build key of last city written to localStorage
var lastCityKey = `cities${localStorage.length - 1}`;
    lastCity = localStorage.getItem(lastCityKey);

// Append stored cities to page
    for (var i = 0; i < localStorage.length; i++) {
      var city = localStorage.getItem("cities" + i);
      var cityEl;
// Set button class to active for currentCity
      if (city === currentCity) {
        cityEl = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
      } else {
        cityEl = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
      }
// Append city to page
    $('#city-results').append(cityEl);
}
// Add a "clear" button to page if there is a cities list
    if (localStorage.length > 0) {
      $('#clear-storage').html($('<a id="clear-storage" href="#">clear</a>'));
    } else {
      $('#clear-storage').html('');
    }
  }
}

// Render the searched cities
renderCities();

// Get the current conditions (which also calls the five day forecast)
getCurrentConditions();