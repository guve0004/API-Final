/* globals APIKEY */

const movieDataBaseURL = "https://api.themoviedb.org/3/";
let imageURL = null;
let imageSizes = [];
let searchString = "";
//let activeWindow = null;
//let isInitialSearch = true;
//let imageURLKey = "imageURL";
//let imageSizesKey = "imageSizesKey";
let timeKey = "timeKey";
//let modeKey = "modeKey";
let staleDataTimeOut = 3600;
let lastRecommendationsURL = "";

document.addEventListener("DOMContentLoaded", init);

function init() {

	getDataFromLocalStorage();

	// Modal
	document.querySelector("#modal").addEventListener("click", showOverlay);
	document.querySelector(".cancelButton").addEventListener("click", hideOverlay);
	document.querySelector(".overlay").addEventListener("click", hideOverlay);
	document.querySelector(".saveButton").addEventListener("click", function (e) {
		let modeList = document.getElementsByName("mode");
		let modeType = null;
		for (let i = 0; i < modeList.length; i++) {
			if (modeList[i].checked) {
				modeType = modeList[i].value;
				break;
			}
		}
		alert(modeType);
		console.log("You picked " + modeType);
		hideOverlay(e);
	});
	// console.log(APIKEY);

	addEventListeners();
	// Elapsed time

}

function showOverlay(e) {
	e.preventDefault();
	let overlay = document.querySelector(".overlay");
	overlay.classList.remove("hide");
	overlay.classList.add("show");
	showModal(e);
}

function showModal(e) {
	e.preventDefault();
	let modal = document.querySelector(".modal");
	modal.classList.remove("off");
	modal.classList.add("on");
}

function hideOverlay(e) {
	e.preventDefault();
	e.stopPropagation();
	let overlay = document.querySelector(".overlay");
	overlay.classList.remove("show");
	overlay.classList.add("hide");
	hideModal(e);
}

function hideModal(e) {
	e.preventDefault();
	let modal = document.querySelector(".modal");
	modal.classList.remove("on");
	modal.classList.add("off");
}

function addEventListeners() {
	let searchButton = document.querySelector(".searchButtonDiv");
	searchButton.addEventListener("click", startSearch);

	let searchResults = document.getElementById("search-results");
	document.getElementById("search-input").addEventListener("keyup",
		function (event) {
			if (event.keyCode === 13) {
				startSearch();
			}
		});

	let backButton = document.getElementById("back-button");
	backButton.addEventListener("click", homePage);
}

function homePage() {
	location.reload();

}
//	searchButton.addEventListener("click", function(){
//      window.location.reload();
//    });


//Check if image secure base url (https) and image sizes array are saved in Loical Storage, if not call getPosterURLAndSizes() 
//if in local storage check if saved over 60 minutes ago, if true then call getPosterURLAndSizes()
//in local storage AND < 60 minutes old, load and use from local storage
function getDataFromLocalStorage() {
	// First see if the key exists in local storage
	if (localStorage.getItem(timeKey)) {
		// Retrieving Saved Date from Local Storage
		let savedDate = localStorage.getItem(timeKey); // get the saved date string
		savedDate = new Date(savedDate); // use this string to initialize a new Date object

		let seconds = calculateElapsedTime(savedDate);

		if (seconds > staleDataTimeOut) {
			console.log("Local Storage Data is stale");
			getPosterURLAndSizes();
		}
	} else {
		saveDateToLocalStorage();
	}
	getPosterURLAndSizes();
}

function saveDateToLocalStorage() {
	console.log("Saving current Date to Local Storage");
	let now = new Date();
	localStorage.setItem(timeKey, now);
}

function calculateElapsedTime(savedDate) {
	let now = new Date(); // get the current time
	console.log(now);

	// calculate elapsed time
	let elapsedTime = now.getTime() - savedDate.getTime(); // this in milliseconds

	let seconds = Math.ceil(elapsedTime / 1000);
	console.log("Elapsed Time: " + seconds + " seconds");
	return seconds;
}


let movieHeader = `Movie Recommendations`;
let tvHeader = `TV Recommendations`;

function setUpModeText() {
	let h1 = document.querySelector("h1");
	let mode = modeType;

	if (mode == "movie") {
		h1.textContent = movieHeader;
	} else {
		h1.textContent = tvHeader;
	}
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

function startSearch() {
	console.log("start search");
	searchString = document.getElementById("search-input").value;
	console.log(searchString);
	if (!searchString) {
		alert("Please enter search data");
		document.getElementById("search-input").focus();
		return;
	}

	// this is a new search so you should reset any existing page data

	getSearchResults(searchString);
}

function getSearchResults(searchString) {

	//let lastRecommendationsURL = "";

	let url = `${movieDataBaseURL}search/movie?api_key=${APIKEY}&query=${searchString}`;
	console.log(url);

	fetch(url)
		.then((response) => response.json())
		.then(function (data) {
			console.log(data);
			// isInitialSearch = true;
			// totalPages = data.total_pages;

			// create page
			createPage(data);
		})
		.catch((error) => alert(error));
}

function createPage(data) {
	let content = document.querySelector("#search-results>.content");

	let title = document.querySelector("#search-results>.title");

	let message = document.createElement("h2");

	content.innerHTML = "";
	title.innerHTML = "";

	if (data.total_results == 0) {
		message.innerHTML = `No results found for "${searchString}"`;
	} else {
		message.innerHTML = `Results 1-20 from a total of ${data.total_results} for "${searchString}" <br> Click on a title to get recommendations`;
		console.log(message.innerHTML);
	}

	title.appendChild(message);

	let documentFragment = new DocumentFragment();

	documentFragment.appendChild(createMovieCards(data.results));

	content.appendChild(documentFragment);

	let cardList = document.querySelectorAll(".content>div");

	cardList.forEach(function (item) {
		item.addEventListener("click", getRecommendations);
	});
}

function createMovieCards(results) {

	let documentFragment = new DocumentFragment();

	results.forEach(function (movie) {

		let movieCard = document.createElement("div");
		let section = document.createElement("section");
		let image = document.createElement("img");
		let videoTitle = document.createElement("p");
		let videoDate = document.createElement("p");
		let videoRating = document.createElement("p");
		let videoOverview = document.createElement("p");

		// set up the content
		videoTitle.textContent = movie.title;
		videoDate.textContent = movie.release_date;
		videoRating.textContent = movie.vote_average;
		videoOverview.textContent = movie.overview;

		// set up image source URL
		image.src = `${imageURL}${imageSizes[2]}${movie.poster_path}`;

		// set up movie data attributes
		movieCard.setAttribute("data-title", movie.title);
		movieCard.setAttribute("data-id", movie.id);

		// set up class names
		movieCard.className = "movieCard";
		section.className = "imageSection";

		// append elements
		section.appendChild(image);
		movieCard.appendChild(section);
		movieCard.appendChild(videoTitle);
		movieCard.appendChild(videoDate);
		movieCard.appendChild(videoRating);
		movieCard.appendChild(videoOverview);

		documentFragment.appendChild(movieCard);

	});
	//console.log(movieCard);
	return documentFragment;
}

function getRecommendations() {
	//    console.log(this);
	let movieTitle = this.getAttribute("data-title");

	searchString = movieTitle;

	let movieID = this.getAttribute("data-id");
	console.log("you clicked: " + movieTitle + "  " + movieID);

	let url = `${movieDataBaseURL}movie/${movieID}/recommendations?api_key=${APIKEY}`;

	fetch(url)
		.then((response) => response.json())
		.then(function (data) {
			console.log(data);

			// create page
			createPage(data);
		})
		.catch((error) => alert(error));
}


//function saveMode() {
//	let emin = document.getElementsByName("mode");
//	if (emin[0] == 1) {
//		mode = "movie";
//	} else {
//		mode = "TV";
//	}
//	console.log(mode);
//}
