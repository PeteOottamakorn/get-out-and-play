//curl -X GET
// "https://developer.nps.gov/api/v1/parks?stateCode=CO&api_key=CIOhNHwWVZAX8YbB1U7TJWA0Q8aazIZthMXdZLmY"
// -H "accept: application/json"
//here we see that the key is a part of the url. I used a stateCode of "CO" here to test, but that can be exchanged for any two-character state code
//we can use "fullName" to get the name of the park
//we can use "description" for the description
//"latitude" and "longitude" can be used with the weather API to get local weather data
//alternately, "addresses.postalCode" can be used to get a five-digit postal code
//"images.url" will give a lovely .jpg of the park

let parkList = JSON.parse(localStorage.getItem("parkData"));

//Function to get data for national parks
function getParks() {
  let state = $("#combobox").val();

  fetch(
    `https://developer.nps.gov/api/v1/parks?stateCode=${state}&api_key=CIOhNHwWVZAX8YbB1U7TJWA0Q8aazIZthMXdZLmY`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response unsuccessful");
      }
      return response.json();
    })
    .then((data) => {
      let parkInfoRaw = JSON.stringify(data);
      localStorage.setItem("parkData", parkInfoRaw);

      $(".parkResults").remove();

      let parkInfoString = localStorage.getItem("parkData");
      let parkInfo = JSON.parse(parkInfoString);
      const parkInformation = parkInfo.data;
      createParkCard(parkInformation);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

//Function to get data for weather
function getWeather(latitude, longitude) {
  fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=imperial&appid=d678cef631da82abd3dcab59ca6a3917`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response unsuccessful");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      let weatherInfoRaw = JSON.stringify(data);
      localStorage.setItem("weatherData", weatherInfoRaw);

      let weatherInfoString = localStorage.getItem("weatherData");
      let weatherInfo = JSON.parse(weatherInfoString);
      let weatherInformation = weatherInfo.list;
      weatherModal(weatherInformation);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

//Creates cards with park info and buttons
function createParkCard(parkInfo) {
  //Iterate through park info in array to create cards
  for (i = 0; i < parkInfo.length; i++) {
    const parkCell = $("<div>").addClass("col parkResults");
    const parkCard = $("<div>").addClass("card h-100");
    const cardImage = $("<img>").addClass("card-img-top");
    const cardBody = $("<div>").addClass("card-body");
    const cardTitle = $("<h3>").addClass("card-title");
    const cardText = $("<p>").addClass("card-text");
    const cardLinkBtn = $("<a>").addClass("btn btn-success").text("Learn More");
    const cardWeatherBtn = $("<button>")
      .attr("type", "button")
      .addClass("btn btn-success")
      .attr("data-bs-toggle", "modal")
      .attr("data-bs-target", "#weatherModal")
      .attr("id", "forecastButton")
      .text("Forecast");

    //Image will be populated from ping to park API
    let parkImage = parkInfo[i].images[0].url;
    cardImage.attr("src", `${parkImage}`);

    //Update the title with the name of the park pulled from the API
    let parkName = parkInfo[i].fullName;
    cardTitle.text(`${parkName}`);

    //Update the text with a short description of the park that cuts off if it's too long
    let description = parkInfo[i].description;
    let maxLength = 200;

    if (description.length > maxLength) {
      description = description.substring(0, maxLength) + "...";
    }

    cardText.text(description);

    //Park info button
    let parkSite = parkInfo[i].url;

    cardLinkBtn.attr("href", `${parkSite}`);

    //Pull park's latitude and longitude
    let latitude = parkInfo[i].latitude;
    let longitude = parkInfo[i].longitude;

    //Event listener for weather button press to call getWeather function and pass latitude and longitude
    cardWeatherBtn.on("click", function () {
      getWeather(latitude, longitude);
    });
    //Append the cards to the body
    cardBody.append(cardTitle, cardText, cardLinkBtn, cardWeatherBtn);
    parkCard.append(cardImage, cardBody);
    parkCell.append(parkCard);
    parkCell.appendTo($("#parkGrid"));
  }
}

//Function that will render park cards again when returning to site after visiting park site
function renderParks() {
  //Assigns empty array to parkList if state input is blank so page will not render all parks across the country upon page load
  if (!parkList) {
    parkList = [];
  } else if ($("#combobox").val() === "") {
    parkList = [];
  } else {
    getParks();
  }
}

function renderModal() {
  //Create modal pop-up to house weather card group
  const weatherModal = $("<div>").addClass("modal fade").attr("tabindex", "-1");
  weatherModal.attr("id", "weatherModal");
  const modalDialog = $("<div>").addClass(
    "modal-dialog modal-dialog-centered modal-lg"
  );
  const modalContent = $("<div>").addClass("modal-content");
  const modalHeader = $("<div>").addClass("modal-header");
  const modalTitle = $("<h4>")
    .addClass("modal-title text-center")
    .text("5-Day Forecast");
  const modalClose = $("<button>")
    .addClass("btn-close")
    .attr("data-bs-dismiss", "modal")
    .attr("aria-label", "Close");
  const modalBody = $("<div>").addClass("modal-body");

  //Append modal to HTML
  weatherModal.appendTo($(".card-grid"));
  weatherModal.append(modalDialog);
  modalDialog.append(modalContent);
  modalContent.append(modalHeader, modalBody);
  modalHeader.append(modalTitle, modalClose);
}

function weatherModal(weatherInfo) {
  //Clears out modal so forecast cards can be replaced
  $(".modal-body").empty();

  //Create card group for 5-day forecast
  const forecastGroup = $("<div>").addClass("card-group");

  //for loop to populate the card group with five day forecast
  for (let i = 0; i < weatherInfo.length; i += 8) {
    //Pull weather information from API (date, temperature, windspeed, humidity) and populate body of card with info
    const forecastCard = $("<div>").addClass("card");
    const forecastIcon = $("<img>").addClass("card-img-top");
    //Assign image based on weather conditions pulled from API
    forecastIcon.attr(
      "src",
      `./assets/images/icons/${weatherInfo[i].weather[0].icon}.png`
    );
    const forecastBody = $("<div>").addClass("card-body");
    const forecastDate = $("<h6>").addClass("card-title");
    forecastDate.text(dayjs.unix(weatherInfo[i].dt).format("MM/DD/YY"));
    const forecastTemp = $("<p>").addClass("card-text");
    forecastTemp.text(`Temp: ${Math.round(weatherInfo[i].main.temp)} F`);
    const forecastWind = $("<p>").addClass("card-text");
    forecastWind.text(`Wind: ${Math.round(weatherInfo[i].wind.speed)} MPH`);
    const forecastHumid = $("<p>").addClass("card-text");
    forecastHumid.text(
      `Humidity: ${Math.round(weatherInfo[i].main.humidity)} %`
    );

    forecastBody.append(
      forecastDate,
      forecastIcon,
      forecastTemp,
      forecastWind,
      forecastHumid
    );
    forecastCard.append(forecastIcon, forecastBody);
    forecastGroup.append(forecastCard);
  }

  $(".modal-body").append(forecastGroup);
}

//Create initialization function when page fully loads
$(document).ready(function () {
  renderParks();

  renderModal();

  $(".selectButton").on("click", getParks);
});
