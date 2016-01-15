var totalMin = 0;
var totalHours = 0;
//ID and key
var myID = '';
var myKey = '';
var myURL = '';
var steamID='';

//Re-check Steam every x minutes.
chrome.alarms.onAlarm.addListener(function(alarm){
	recheck(myURL);
});

//Helper function to load secret file.
function loadJSON(path, success, error){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

//Actually loads secret file
loadJSON('secrets.json',
         function(data) { myKey = data['key']; },
         function(xhr) { console.error(xhr); }
);

//Watch for changes set in Options
chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (key in changes) {
		var storageChange = changes[key];
		console.log('Storage key "%s" in namespace "%s" changed. ' +
			'Old value was "%s", new value is "%s".',
			key,
			namespace,
			storageChange.oldValue,
			storageChange.newValue);
	}
	totalHours = 0;
	getSteamID();
});

//Set badge color based on hours spent playing games.
function setColor(input){
	var R, G;
	if (input >= 100){
		R = 255;
		G = 0;
	} else {
		R = Math.round((255 * input) / 100);	
		G = Math.round((255 * (100 - input)) / 100);
	}
	theColorWeChooseToKillKuzco = [R,G,0,255];
	chrome.browserAction.setBadgeBackgroundColor({ color: theColorWeChooseToKillKuzco });
}

//
function getSteamID(){
	var urlOriginal;
	var url;
	var xhr;
	chrome.storage.sync.get('steamID', function(items) {
		urlOriginal = items['steamID'];
		url = urlOriginal + '/\?xml\=1';
		console.log('Connecting to ' + url);
		
		//Create new XML Request
		xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					console.log(xhr.response);
					var oParser = new DOMParser();
					var oDOM = oParser.parseFromString(xhr.response, "text/xml");
					steamID = oDOM.getElementsByTagName('steamID64')[0].textContent;
					myID = steamID;
					console.log('Your steamID64 is ' + myID);
					myURL = 'http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=' + myKey + '&steamid=' + myID + '&format=json';
					//-----------------------------------
					recheck(myURL);
				} else {
					console.log("Step 1 fail");
				}
			}
		}
		xhr.send();
	});
};

checkPeriod = 30; //In minutes.
function recheck(url){
	var xhr2 = new XMLHttpRequest();
	xhr2.open('GET', myURL, true);
	xhr2.onreadystatechange = function() {
		if(xhr2.readyState == 4) {
			if(xhr2.status == 200) {
				console.log('are we there yet');
				data = JSON.parse(xhr2.response);
				console.log('gone thru the win');
				console.log(data);
				gameList = data.response.games;
				totalMin = 0;
				gameList.forEach(function(el, index, array){
            		//do all the stuff
            		console.log(el.playtime_2weeks);
            		totalMin += el.playtime_2weeks;
            		totalHours = totalMin/60;
            	});
				chrome.alarms.create('checkSteam', {delayInMinutes: checkPeriod,
					periodInMinutes: checkPeriod});
				chrome.browserAction.setBadgeText({text: Math.ceil(totalHours).toString()});
				setColor(Math.round(totalHours));
			} else {
            	// try to capture error and retry
            	console.log('Step 2 fail');
            }
        }
    }
    xhr2.send();
};