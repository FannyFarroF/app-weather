const forecastContainer = document.getElementById('forescast-container')
const form        = document.getElementById("form");
const app         = document.getElementById("app");
const scala       = document.getElementById('scala')
const body        = document.getElementById('results-search')
const spinner     = document.getElementById('spinner')
const scalaTitle  = document.getElementById('scala-title')
const otherCities = document.getElementById('other-cities')
const cardMain    = document.getElementById('card-main')
let data          = { city: "Pimentel" };
const apiKey      = "445ee35dd8fe497ce684bdb84eb0200d";
let dataAPI       = {}
const cities      = [
  {name: 'Lima', country: 'PE'},
  {name: 'Paris', country: 'FR'},
  {name: 'Palermo', country: 'IT'},
  {name: 'Queenstown', country: 'ZA'}
]

document.addEventListener('DOMContentLoaded', () => {
  body.classList.add('hidden')
  getWeatherAll()
})

form.addEventListener("submit", handleFormSubmit);
form.addEventListener("change", updateObjectData);
scala.addEventListener("change", toggleScale)

function handleFormSubmit(e) {
  e.preventDefault();
  if (!data.city.trim()) return addAlert("Búsqueda en blanco", 'error');

  getWeatherMain();
}

function updateObjectData(e) {
  data[e.target.name] = e.target.value;
}

function resetForm() {
  form.reset();
  data = { city: "" };
}

function getWeatherAll() {
  body.classList.add('hidden');
  addSpinner()

  const promises = cities.map(city => fetchWeather(city.name, city.country));

  Promise.all(promises)
    .then(results => {

      otherCities.innerHTML = '';
      results.forEach(item => displayWeather(item))
      getWeatherMain()
      removeSpinner()
      body.classList.remove('hidden')

    }).catch(error => {
      console.log(error);
    })
}

function fetchWeather(city, country='') {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}`;
  return fetch(url)
    .then(result => result.json())
    .catch((error) => {
      console.log(error);
    });
}

function displayWeather(weatherData) {
  const { name, main: {temp}, weather: [main], sys: {country}} = weatherData;
  
  const card = `
    <div class="card p-4 rounded-xl bg-custom">
        <div class="content-card flex flex-row items-center">
            <div class="title basis-2/4">
                <p class="text-gray-500 m-0 text-sm font-regular uppercase">${country}</p>
                <p class="my-2 text-xl font-regular text-gray-50">${name}</p>
                <p class="m-0 text-sm font-regular text-gray-200 capitalize">${main.description}</p>
            </div>
            <div class="basis-2/4">
                <div class="icon flex items-center justify-end">
                    <img src="https://openweathermap.org/img/wn/${main.icon}.png" alt="">
                </div>
                <div class="text flex items-center justify-end">
                    <h2 class="text-2xl font-medium text-gray-200">
                      <span class="temp">${changeTempToScala('c', temp)}</span>°
                    </h2>
                </div>
            </div>
        </div>
    </div>
  `
  otherCities.insertAdjacentHTML('beforeend', card)
}

async function getWeatherMain() {
  const weatherData = await fetchWeather(data.city)

  if (weatherData) {
    if (weatherData.cod != 200) return addAlert('Ciudad no existe', 'error')

    getForecast(data.city)
    displayMainWeather(weatherData)

    if (body.classList.contains('hidden')) body.classList.remove('hidden')
  }
}
    
function getForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
  
  fetch(url)
    .then((result) =>result.json())
    .then(forecastData => {
      
      const forecastList = forecastData.list.filter((item, index) => index % 8 === 0);
      forecastContainer.innerHTML = '';
      forecastList.forEach(item => displayForecast(item))

    }).catch((error) => {
        console.log(error);
    });
}

function displayForecast(forecast) {
  const date = new Date(forecast.dt * 1000); 
  const day = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
  const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const iconUrl     = `http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;
  const temp        = forecast.main.temp;
  const description = forecast.weather[0].description;

  const card = `
    <div class="px-2 py-4 text-slate-200 rounded-xl bg-custom card basis-1/5">
      <h3 class="text-slate-300">${day}</h3>
      <p class="text-slate-300">${time}</p>
      <div class="flex items-center justify-center">
          <img src="${iconUrl}" alt="${description}">
      </div>
      <p class="text-bold text-slate-50 font-bold">  <span class="temp">${changeTempToScala('c', temp)}</span>° </p>
      <p class="capitalize text-slate-400"> ${description}</p>
    </div> 
  `

  forecastContainer.insertAdjacentHTML('beforeend', card);
}

function displayMainWeather(response) {
  const { main: {temp, feels_like}, sys: {country}, weather: [main], wind: {speed}  } = response;
  dataAPI = { temp, feels_like }
  cardMain.innerHTML = ''
  
  const card = `
    <div class="card-body">
      <div class="content-card flex flex-row items-center">
          <div class="title basis-2/4">
              <h2 class="text-5xl font-bold text-center text-gray-200"> <span class="temp">${changeTempToScala('c', temp)}</span>°</h2>
          </div>
          <div class="basis-2/4 text-end">
              <p id="country" class="text-gray-500 m-0 text-sm font-regular uppercase">${country}</p>
              <p id="city" class="m-0 text-xl font-regular uppercase text-gray-50">${data.city}</p>
          </div>
      </div>
      <div class="footer-card flex flex-row items-center mt-4">
          <div class="basis-2/4 flex items-center">
              <img src="https://openweathermap.org/img/wn/${main.icon}.png" alt="" id="icon">
              <p id="weather" class="text-gray-50 m-0 text-sm font-regular capitalize">${main.main}</p>
          </div>
          <div class="basis-2/4 text-end">
              <p class="text-gray-50 m-0 text-sm font-regular">
                  <i class="fas fa-wind mr-2"></i>
                  <span id="wind">${changeTempToScala('c', speed)}</span> m/s
              </p>
          </div>
      </div> 
      <div class="footer-card flex flex-row items-center px-2 mt-4">
          <div class="title basis-2/4">
              <p class="text-slate-200 m-0 text-sm font-regular">
                  Feel Like: <span class="temp">${changeTempToScala('c', feels_like)}</span> °
              </p>
          </div>
          <div class="basis-2/4 text-end">
          </div>
      </div>
    </div>
  `
  cardMain.insertAdjacentHTML('beforeend', card)
  resetForm();
}

function addAlert(message, type) {
    const color = type == 'error' ? 'red-600' : 'green-600'
    const icon  = type == 'error' ? 'exclamation' : 'check'
    const alert = `
        <div id="alert" class="border-1 border-red-500 w-80 p-3 bg-white rounded-xl absolute top-4 right-6">
            <p class="text-center text-${color}">  
                <i class="fas fa-${icon}-circle me-2"></i>
                ${message} 
            </p>
        </div>
    `;
    app.insertAdjacentHTML("beforeend", alert);
    setTimeout(() => document.getElementById('alert').remove(), 5000);
}

function toggleScale(e) {
  const scale = e.target.checked ? 'c' : 'f'
  scalaTitle.innerText = e.target.checked ? '°C' : '°F';
  updateTemperatures(scale)
}

function changeTempToScala(scale, temp) {
  return scale == 'f' ? (9/5*temp + 32).toFixed(2) : ((temp-32)*5/9).toFixed(2);
}

function updateTemperatures(scale) {
  const tempElements = document.querySelectorAll('.temp')
  tempElements.forEach(tempElement => {
    const currentTemp = parseFloat(tempElement.textContent);
    tempElement.textContent = `${changeTempToScala(scale, currentTemp)}`;
  })
}

function addSpinner() {
  const div = `
    <button type="button" class="bg-indigo-500 rounded-3xl p-3 text-white" disabled>
        <i class="fas fa-spinner animate-spin h-5 w-5 mr-3"  viewBox="0 0 24 24"></i>
        Buscando
    </button>
  `
  spinner.insertAdjacentHTML('beforeend', div)
}

function removeSpinner() {
    spinner.innerHTML = ''
}