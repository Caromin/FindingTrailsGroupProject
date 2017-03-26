var filterList = [" hiking ", " camping ", " caving ", " trail running ", " snow sports ", " horseback riding ", " mountain biking ", " water sports "];
var random = ["Current Temperature: ", "Same Time Tomorrow: "];

//Set variables for windows loading page (This is Lake Mary, Fl)
var lat = 28.741898;
var lng = -81.305587;
var zoom = 10;
var activities = "";

// variables to change the location of google maps
var markers = [];
var nameList = [];
var descriptionList = [];
var temperatures = [];

// Initialize Firebase
var config = {
    apiKey: "AIzaSyD5NXLlTfIfpROe5y5e5-k-MG3L4PKVAeY",
    authDomain: "trail-tracker-89184.firebaseapp.com",
    databaseURL: "https://trail-tracker-89184.firebaseio.com",
    storageBucket: "trail-tracker-89184.appspot.com",
    messagingSenderId: "47518348432"
  };
  firebase.initializeApp(config);

//variables for connections to firebase
var database = firebase.database();
var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");

//used to check if anyone is online
connectedRef.on("value", function(snap) {
	if(snap.val()) {
//when someone is online they are pushed to the connects list		
		var con = connectionsRef.push(true);
//when someone leaves, they are removed from the list		
		con.onDisconnect().remove();
	}
});

//displays the number of active users
connectionsRef.on("value", function(snap) {
	$("#activeUsers").text(" : " + snap.numChildren() + " user(s) following the trail");
});

//functions that will generate the list of buttons for some of the variable selections
function checkBox() {
	for (i = 0; i < filterList.length; i++) {
		var button = $('<input type="checkbox">');
		button.attr("data-value", filterList[i].trim());
		button.attr('id', 'filterList' + i);
		$('#filter-input').append(button, filterList[i] + "<br />");
	}
// End of the checkbox function
}


//this is the function that runs at the end of the googleAPI script 
function initMap() {
//where the map will be displayed	
		mapDiv = $('#input-display');
//generating the map with the specific parameters	
		map = new google.maps.Map(mapDiv[0], {
//set center of map on load
		center: {lat: lat, lng: lng},
//set zoom, lower number means zoom out, and vice versa
		zoom: zoom,
//you can set map type to roadmap, terrain, satellite, or hybrid
		mapTypeId: 'hybrid',
//If you plan to move a control on the screen
//it is recommened to set that control to true to always show
		mapTypeControl: true,
//this sets the position, go to docs to see other positions
		mapTypeControlOptions: {
		position: google.maps.ControlPosition.TOP_LEFT
		},
//same as before, just different controls
		fullscreenControl: true,
		fullscreenControlOptions: {
		position: google.maps.ControlPosition.LEFT_TOP
		},
		streetViewControl: true,
		streetViewControlOptions: {
		position: google.maps.ControlPosition.LEFT_TOP 
		},
		zoomControl: true,
		zoomControlOptions: {
		position: google.maps.ControlPosition.LEFT_TOP
		}	
		});

		autoSearch = new google.maps.places.Autocomplete(document.getElementById('name-input'));
		geocoder = new google.maps.Geocoder();
//End of the initMap function			
}

//function using lat and lon from google input, search weather for the current location
function getWeather (latitude,longitude) {
//lat and long from google maps parameters, working	
	console.log('weather from google latitude: ' + latitude);
	console.log('weather from google longitude: ' + longitude);

var api = "53fb1b9b0349881266fc5c7bd0982a7f";
	$.ajax({
		url: "http://api.openweathermap.org/data/2.5/forecast/daily?lat=" + latitude + "&lon=" + longitude + "&cnt=3&units=imperial&APPID=" + api,
		type: "GET",

	})
//after the data in the url is DONE, THEN do this
//data and data.list have to use the same variable 
	.done(function(data) {
//checking to see if i can pull data, working		
	// console.log(data.name);

//simple for loop to pull todays and tomorrows temperature
//random is just a array with current, tomorrow headings
for (i = 0; i < 2; i++)	{
	var tempts = Math.floor(data.list[i].temp.day);
	temperatures.push(tempts);
	// console.log(temperatures);
    $('#weatherDiv').append("<p class='temporary'><b>" + random[i] + "</b>" +"<br />Temperature: " + temperatures[i] + "F</p>")
//end of the for loop  
   }
//end of the .done function   
   });
//end of the getweather function
}

//Function that pushes lat and long parameters and display results via trailAPI markers
function trailFinder (latitude, longitude) {
	$.ajax({
    url: "https://trailapi-trailapi.p.mashape.com/", 
    type: 'GET',
//parameters that can be changed    
    data: {
//set limit by me    	
    	'limit': 10,
//will be used for filter options    	
    	'q[activities_activity_type_name_eq]': activities,
//set limit by me      	
    	'radius': 50,
//not needed anymore   	
//     	'q[city_cont]': null,   	
//     	'q[state_cont]': null,
//uses parameters from google maps search  	
    	'lat': latitude,  	
    	'lon': longitude
		}, 
    datatype: 'json',
//success: function(data) { alert(JSON.stringify(data)); },
    error: function(err) { alert(err); },
    beforeSend: function(xhr) {
// Mashape key from TrailAPI
    xhr.setRequestHeader("X-Mashape-Authorization", "NQTdn7V99JmshrgWNZDbdFehWFX8p17WiaijsnBkVdo5einCNy");
    	}
	})

//When the ajax call is DONE, do this below
.done(function(response) {
// //Checking to see if the lat and long are really from google maps	
// 	console.log('trail from google latitude: ' + latitude);
// 	console.log('trail from google longitude: ' + longitude);
//Creating a for loop to generate a marker for 10 places, "places" is the object when using trailAPI website	
	for (i=0; i<10; i++) {
//Checking to see the places that will be displayed via console.log, yes 	
	console.log(response.places[i]);

//Creating a name and description variable for the trailAPI data and pushing to two empty arrays	
	var name = response.places[i].name;
	var description = response.places[i].description;
  		nameList.push(response.places[i].name);
  	if (response.places[i].description === null) {
  		 descriptionList.push("Description not provided by TrailAPI")}
  	else { descriptionList.push(response.places[i].description);}

  	
// _______________________________________________
//testing for filters
//did not push to empty array when inside the second loop

// 			for (i=0; i<filterList.length; i++) {
// 				if ("hiking" == response.places[i].activities[i])
// 			}



// var filterList = [" hiking ", " camping ", " caving ", " trail running ", " snow sports ", " horseback riding ", " mountain biking ", " water sports "];

// _______________________________________________


//Checking to see if they get pushed to empty array, they do!
 	// console.log(nameList);
	// console.log(descriptionList);

//Creates a infomarker with data from the empty array name and description
//Then also generates the marker with the trailAPI lat and lon provided
//Left the function inside the TrailAPI for use of variable scope
//PREVIOUS PROBLEM FYI: ALL MARKERS WERE SETTING TO INFO FROM THE LAST MARKER, 
//IT IS BECAUSE THE INFORMATION WAS NOT BEING STORED ANYWHERE, SO WE STORED IT AND REQUESTED IT[i] EVERYTIME THE FUNCTION RAN 	
function addInfomarker() {	
 	var infoWindow = new google.maps.InfoWindow({ 		
		content: '<div class="trail">' + nameList[i] + " " +  '<br /><br />' + descriptionList[i] + '</div>'
        });

//Creating a marker at each place location
	markers[i] = new google.maps.Marker({
//lat and lng are provided by the trailAPI looking for nearby locations		
		position: {'lat': response.places[i].lat, 'lng': response.places[i].lon},
		map: map
				});
// Adds click listener to each individual marker and then opens the info window and centers
        markers[i].addListener('click', function(){
        	infoWindow.open(map, this);
			map.setCenter(this.getPosition());
        });
//Onclick that closes infowindow if user clicks map        
google.maps.event.addListener(map, "click", function(event) {
    infoWindow.close();
});
    }
//Runs the addInfo function inside the .done response     
addInfomarker();       

//End of the for loop
	}
    nameList = [];
	descriptionList = [];		
});

//End of trailFinder function
}


//When the page loads, this will run
$(window).on("load", function() {
	checkBox();
 	$("#submit-button").on("click", function(event) {
    	event.preventDefault();
//emptys weatherDiv display and temp array for next location    	
    	$('#weatherDiv').html("");
    	temperatures = [];
    	name = $('#name-input').val();
    	$('#test').html("<p><b>Current Location:</b><br />" + name.toUpperCase() + "</p>");
//get the search value
  		var searchValue = $("#name-input").val();
//use geocoder
//the first parameter is an object with 'address', which is used if you
//want to get coordinates from an address
//to get an address from coordinates, use 
//{'location': {'lat': 28.5383355, 'lng': -81.37923649999999}}
//the second parameter is a callback function
  		geocoder.geocode({'address': searchValue}, function(results, status) {
	  	if(status === 'OK') {
//results is going to be the address, but it is 
//going to give you a multiple choices in an array
//the first is probably the most accurate, so results[0] is your best bet.
//geometry.location is where you need to go to get
//the latitude and longitude, using the lat() and lng() functions
  			var geometry = results[0].geometry.location;
  			latitude = geometry.lat();
  			longitude = geometry.lng();
  			

// ----------Below is trail API + Initial Marker info/parameters------------  			
  			trailFinder(latitude, longitude);
  			getWeather(latitude, longitude);
//Set a marker at location
  			var marker = new google.maps.Marker({
				position: {'lat': latitude, 'lng': longitude},
				map: map
			});
//information for startinfo marker infoWindow			
			var startInfo = new google.maps.InfoWindow({ 		
			content: '<div class="trail">' + name + "<br />lat:  " + latitude + "<br />lat:  " + longitude +'</div>'
        });
//center the map to the marker position and displays info marker
			marker.addListener('click', function() {
			startInfo.open(map, marker);
			map.setCenter(this.getPosition());
			});
//center the map to the marker position
			map.setCenter(marker.getPosition());
//map event when clicked closes start info marker			
			google.maps.event.addListener(map, "click", function(event) {
    		startInfo.close();
    		});	
			}
//End of the geocode/marker function	  			
	  	});
//End of the submit-button function	 
//Emptying out the input and emptying out the arrays for the next search 
    $('#name-input').val("");
	});
// --------------------------------------------------------


//console log gives me 50, because its giving the direct link count til it reaches that string , so it is basically 50 > -1    	
// console.log(window.location.href);
//if else statements to disable the buttons if the user is currently on that page	   
    $("#homepage").on("click", function(event) {
		if (window.location.href.indexOf('mainpage.html') > -1) {
			$(this).prop('disabled', true);
			event.preventDefault();
			}
		else {
			window.location.href = 'mainpage.html';
		};
	});	
    $("#aboutUs").on("click", function(event) {
		if (window.location.href.indexOf('aboutus.html') > -1) {
			$(this).prop('disabled', true);
			event.preventDefault();
			}
		else {
			window.location.href = 'aboutus.html';
		};
	});
//End of the window.onload function
});	
