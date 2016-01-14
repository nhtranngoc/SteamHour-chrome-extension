var cmt = "";

document.addEventListener('DOMContentLoaded', function () {
   var bg = chrome.extension.getBackgroundPage();
    var myHours = bg.totalHours.toFixed(2);
    if (bg.myID == ''){
    	alert('You need to set up your SteamID in options.');
    }
    var myID = bg.myID;
  document.getElementById('hours').innerHTML=myHours.toString();
  document.getElementById('id').innerHTML=myID.toString();
  commentOnHours('comment', Math.ceil(myHours));
});

function commentOnHours(tagID, hours){
	switch(true){
		case (hours < 10):
			cmt = "You're doing a great job!";
			break;
		case (hours >= 10 && hours < 20):
			cmt = "Moderation is key.";
			break;
		case (hours >= 20 && hours < 40):
			cmt = "Gaming could be your part time job. Are you a streamer?";
			break;
		case (hours >=40 && hours < 60):
			cmt = "Can I have a link to your twitch stream?";
			break;
		case (hours >=60 && hours < 80):
			cmt = "You better be a game developer with this much hours";
			break;
		case (hours >= 80):
			cmt = "Have you tried going outside? I heard the weather is nice this time of the year";
			break;
		default:
			cmt = "aaa";
	}

	document.getElementById(tagID).innerHTML= cmt;
}