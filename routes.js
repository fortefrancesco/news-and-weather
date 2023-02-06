const router = require('express').Router()
require('dotenv').config()
const fetch = require('node-fetch')


//test per togliere ripetizioni
const  jsondict = {
      "city": null,
      "temp": null,
      "description": null,
      "humidity": null,
      "wind": null,
      "imgsrc": null,
      "aq": null,
      "min": null,
      "max": null,
      "imgtoday": null,
      "imgtom": null,
      "mintom": null,
      "maxtom": null,
      "imgdayafter": null,
      "mindayafter": null,
      "maxdayafter": null,
      "unsplash": "/img/landscape.webp",
      "day1": null,
      "day2": null,
      "day3": null,
      "imgday3": null,
      "min3": null,
      "max3": null,
      "feels": null,
      "day4": null,
      "imgday4": null,
      "min4": null,
      "max4": null,
      "day5": null,
      "imgday5": null,
      "min5": null,
      "max5": null,
      "sunrise": null,
      "sunset": null,
      "art1":null,
      "art2":null,
      "art3":null,
      "art4":null,
      "art5":null,
      "art6":null,
      "art7":null,
      "url1":null,
      "url2":null,
      "url3":null,
      "url4":null,
      "url5":null,
      "url6":null,
      "url7":null
    }



//-----------------------------

//prende le news random della città di cui si cerca il meteo
async function getNews(city) {
  var random = Math.floor(Math.random() * 4)
  var newslist = []
  var linklist = []
  var stri = `https://gnews.io/api/v4/search?q=${city}&token=${process.env.API_KEY_NEWS}&lang=it&max=100`
  try{
      await fetch (stri)
      .then(res => res.json())
      .then(data => {for(let i = 0; i < 7; i++) {

          newslist[i] = data.articles[i + random].title
          linklist[i] = data.articles[i + random].url
        }}
        )   
      
        
  } catch (err) {
    
    console.log("Errore con il caricamento delle news")
    jsondict.newslist = "Al momento non sono disponibili le news di questa città"
  }
  news_final =newslist.concat(linklist)
  return news_final

}


//prende un'immagine random della città di cui si cerca il meteo
async function getImage (city,key) {
  var random = Math.floor(Math.random()*10)
  const unsplashUrl = `http://api.unsplash.com/search/photos?query=${city}&client_id=${key}`
  var backgroundLink
  try{
    await fetch (unsplashUrl)
      .then(res => res.json())
      .then(data => backgroundLink = data.results[random].urls.regular)      
  } catch (err) {
    console.log("Errore con il caricamento dello sfondo")
    backgroundLink = "/img/landscape.webp"
  }
  return backgroundLink
}

//funzione che ritorna la qualità dell'aria nella città
async function getAQ (lat,lon,key) {
  const aqiUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}`
  var aq
  try{
    await fetch(aqiUrl)
      .then(res => res.json())
      .then(data => aq = data.list[0].main.aqi)
  } catch (err) {
    console.log("Errore nella chiamata fetch API per AIR QUALITY INDEX!")
  }
  if(isNaN(aq))
    aq = "Errore!"
  return aq
}

router.get('/', (req,res) => {
  res.render("index")
})

router.get('/meteo', async (req,res) => {
  //passaggio per prendere reale indirizzo IP client e non del server che effettua la richiesta
  var ipAddr = req.headers["x-forwarded-for"];
  if (ipAddr){
    var list = ipAddr.split(",");
    ipAddr = list[list.length-1];
  } else {
    ipAddr = "93.34.129.100";//"req.connection.remoteAddress"
  }
  const ipUrl = `http://ip-api.com/json/${ipAddr}`
  var city, lat, lon
  try{
    await fetch (ipUrl)
      .then(res => res.json())
      .then(data => {
        city = data.city
        lat = data.lat
        lon = data.lon
      })
  } catch (err) {
    console.log("Errore chiamata GET e recupero location tramite IP")
    jsondict.city = null
    res.render("meteo", jsondict)
  }
  var news_final = await getNews(city)
  var aq = await getAQ(lat,lon,process.env.API_KEY)
  var backgroundLink = await getImage(city,process.env.UNSPLASH_KEY)

  if(lat || lon && aq){
    //onecall 1.0 api
    const weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,hourly&appid=${process.env.API_KEY}`
    try{
      await fetch(weatherUrl)
        .then(res => res.json())
        .then(data => {
          if(data.message === 'city not found' || data.message === 'wrong latitude' || data.message === 'wrong longitude'){
            jsondict.city = data.message
            res.render('meteo', jsondict)
          } else {
            const index = ["Good", "Fair", "Moderate", "Poor", "Very poor"]
            const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
            var date = new Date ()
            var sunrise = new Date (data.current.sunrise * 1000)
            if(sunrise.getMinutes()<10){
              var sunrmin = '0' + sunrise.getMinutes()
            } else {
              var sunrmin = sunrise.getMinutes()
            }
            var sunset = new Date (data.current.sunset * 1000)
            if(sunset.getMinutes()<10){
              var sunsmin = '0' + sunset.getMinutes()
            } else {
              var sunsmin = sunset.getMinutes()
            }
            res.render('meteo', {
              city: city,
              temp: data.current.temp,
              description: data.current.weather[0].description,
              humidity: data.current.humidity,
              wind: data.current.wind_speed,
              imgsrc: "https://openweathermap.org/img/w/" + data.current.weather[0].icon + ".png",
              aq: index[aq-1],
              min: data.daily[0].temp.min,
              max: data.daily[0].temp.max,
              imgtoday: "https://openweathermap.org/img/w/" + data.daily[0].weather[0].icon + ".png",
              imgtom: "https://openweathermap.org/img/w/" + data.daily[1].weather[0].icon + ".png",
              mintom: data.daily[1].temp.min,
              maxtom: data.daily[1].temp.max,
              imgdayafter: "https://openweathermap.org/img/w/" + data.daily[2].weather[0].icon + ".png",
              mindayafter: data.daily[2].temp.min,
              maxdayafter: data.daily[2].temp.max,
              unsplash: backgroundLink,
              day1: days[(date.getDay() + 1) % 7],
              day2: days[(date.getDay() + 2) % 7],
              day3: days[(date.getDay() + 3) % 7],
              imgday3: "https://openweathermap.org/img/w/" + data.daily[3].weather[0].icon + ".png",
              min3: data.daily[3].temp.min,
              max3: data.daily[3].temp.max,
              feels: data.current.feels_like,
              day4: days[(date.getDay() + 4) % 7],
              imgday4: "https://openweathermap.org/img/w/" + data.daily[4].weather[0].icon + ".png",
              min4: data.daily[4].temp.min,
              max4: data.daily[4].temp.max,
              day5:  days[(date.getDay() + 5) % 7],
              imgday5: "https://openweathermap.org/img/w/" + data.daily[5].weather[0].icon + ".png",
              min5: data.daily[5].temp.min,
              max5: data.daily[5].temp.max,
              sunrise: (sunrise.getHours()+2) + ":" + sunrmin,
              sunset: (sunset.getHours()+2) + ":" + sunsmin,
              art1:news_final[0],
              art2:news_final[1],
              art3:news_final[2],
              art4:news_final[3],
              art5:news_final[4],
              art6:news_final[5],
              art7:news_final[6],
              url1:news_final[7],
              url2:news_final[8],
              url3:news_final[9],
              url4:news_final[10],
              url5:news_final[11],
              url6:news_final[12],
              url7:news_final[13]

            })
          }
        })
    } catch (err) {
      console.log("Errore nel Weather API Call") 
      jsondict.city = "Something went wrong with weather!"
      res.render('meteo', jsondict)
    }
  } else {
    console.log("Errore nelle coordinate o nell'air quality index. CONTROLLARE API")
  }
})

router.post('/meteo', async (req,res) => {
  const city = req.body.city
  var backgroundLink = await getImage(city,process.env.UNSPLASH_KEY)
  var news_final = await getNews(city)
  var lat,lon
  const geocodingUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${process.env.API_KEY}`
  try{
    await fetch(geocodingUrl)
      .then(res => res.json())
      .then(data => {
        lat = data[0].lat;
        lon = data[0].lon;
      })
    } catch (err) {
      console.log("Errore nel Geocoding API Call")
      jsondict.city= "Something went wrong with coordinates!"
      res.render('meteo', jsondict)
    }
    var aq = await getAQ(lat,lon,process.env.UNSPLASH_KEY)
    if(lat || lon && aq){
      //onecall 1.0 api
      const weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,hourly&appid=${process.env.API_KEY}`
      try{
        await fetch(weatherUrl)
          .then(res => res.json())
          .then(data => {
            if(data.message === 'city not found' || data.message === 'wrong latitude' || data.message === 'wrong longitude'){
              jsondict.city = data.message
              res.render('meteo', jsondict)
            } else {
              const index = ["Good", "Fair", "Moderate", "Poor", "Very poor"]
              const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
              var date = new Date ()
              var sunrise = new Date (data.current.sunrise * 1000)
              if(sunrise.getMinutes()<10){
                var sunrmin = '0' + sunrise.getMinutes()
              } else {
                var sunrmin = sunrise.getMinutes()
              }
              var sunset = new Date (data.current.sunset * 1000)
              if(sunset.getMinutes()<10){
                var sunsmin = '0' + sunset.getMinutes()
              } else {
                var sunsmin = sunset.getMinutes()
              }
              res.render('meteo', {
                city: city,
                temp: data.current.temp,
                description: data.current.weather[0].description,
                humidity: data.current.humidity,
                wind: data.current.wind_speed,
                imgsrc: "https://openweathermap.org/img/w/" + data.current.weather[0].icon + ".png",
                aq: index[aq-1],
                min: data.daily[0].temp.min,
                max: data.daily[0].temp.max,
                imgtoday: "https://openweathermap.org/img/w/" + data.daily[0].weather[0].icon + ".png",
                imgtom: "https://openweathermap.org/img/w/" + data.daily[1].weather[0].icon + ".png",
                mintom: data.daily[1].temp.min,
                maxtom: data.daily[1].temp.max,
                imgdayafter: "https://openweathermap.org/img/w/" + data.daily[2].weather[0].icon + ".png",
                mindayafter: data.daily[2].temp.min,
                maxdayafter: data.daily[2].temp.max,
                unsplash: backgroundLink,
                day1: days[(date.getDay() + 1) % 7],
                day2: days[(date.getDay() + 2) % 7],
                day3: days[(date.getDay() + 3) % 7],
                imgday3: "https://openweathermap.org/img/w/" + data.daily[3].weather[0].icon + ".png",
                min3: data.daily[3].temp.min,
                max3: data.daily[3].temp.max,
                feels: data.current.feels_like,
                day4: days[(date.getDay() + 4) % 7],
                imgday4: "https://openweathermap.org/img/w/" + data.daily[4].weather[0].icon + ".png",
                min4: data.daily[4].temp.min,
                max4: data.daily[4].temp.max,
                day5:  days[(date.getDay() + 5) % 7],
                imgday5: "https://openweathermap.org/img/w/" + data.daily[5].weather[0].icon + ".png",
                min5: data.daily[5].temp.min,
                max5: data.daily[5].temp.max,
                sunrise: (sunrise.getHours() + 2) + ":" + sunrmin,
                sunset: (sunset.getHours() + 2) + ":" + sunsmin,
                art1:news_final[0],
                art2:news_final[1],
                art3:news_final[2],
                art4:news_final[3],
                art5:news_final[4],
                art6:news_final[5],
                art7:news_final[6],
                url1:news_final[7],
                url2:news_final[8],
                url3:news_final[9],
                url4:news_final[10],
                url5:news_final[11],
                url6:news_final[12],
                url7:news_final[13]  
              })
            }
          })
      } catch (err) {
        console.log("Errore nel Weather API Call")
        jsondict.city = "Something went wrong with weather!"
        res.render('meteo', jsondict)        
      }
    } else {
      console.log("Errore nelle coordinate o nell'air quality index. CONTROLLARE API")
    }
})

module.exports = router
