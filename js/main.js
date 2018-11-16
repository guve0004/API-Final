/* globals APIKEY */

const movieDataBaseURL = "https://api.themoviedb.org/3/";
let imageURL = null;
let imageSizes = [];

document.addEventListener("DOMContentLoaded", init);

function init() {
    // console.log(APIKEY);
    addEventListeners();
    getDataFromLocalStorage();
}

function addEventListeners() {


}

function getDataFromLocalStorage() {
    // Check if image secure base url (https) and image sizes array are saved in Loical Storage, if not call getPosterURLAndSizes() 


    // if in local storage check if saved over 60 minutes ago, if true then call getPosterURLAndSizes()


    // in local storage AND < 60 minutes old, load and use from local storage

    getPosterURLAndSizes();
}

function getPosterURLAndSizes() {

    //https://api.themoviedb.org/3/configuration?api_key=<<api_key>>

    let url = `${movieDataBaseURL}configuration?api_key=${APIKEY}`;

    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
        
            imageURL = data.images.secure_base_url;
            imageSizes = data.images.poster_sizes;
        
            console.log(imageURL);
            console.log(imageSizes);
        })
        .catch(function (error) {
            console.log(error);
        })
    
}
