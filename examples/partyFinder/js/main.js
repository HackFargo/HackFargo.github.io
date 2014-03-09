$(function () {
   
	$.getJSON('http://api.hackfargo.co/calls/type/party?state=3-7-2013&end=3-7-2014', function(parties) {

		var length = parties.length;
		 for (var i = 1; i <= 6; i++) {
		 	var index = Math.floor(length*Math.random()); 
	 		var party = parties[index];
	 		$('.face' + i).html('<p class="partyType">' + party.Description + '</p>' + '<p>' + party.Meta.Address + '</p>');
		 }
	});

   $(".spinIt").click(function() {
   		var sideToShow = Math.floor(Math.random() * 6) + 1;

   		var nX = Math.floor(Math.random() * 10) - 5;
   		var nY = Math.floor(Math.random() * 10) - 5;

		var rotateX = nX * 360;
		var rotateY = nY * 360;

		switch (sideToShow)
		{

			case 1:
				break;
			case 2:
				rotateY += 180;
				break;
			case 3:
				rotateY += 270;
				break;
			case 4:
				rotateY += 90;
				break;
			case 5:
				rotateX += 270;
				break;
			case 6:
				rotateX += 90;
				break;
		}

   		$(".cube").css("-webkit-transform", "rotateX("+rotateX+"deg) rotateY("+rotateY+"deg)");
   })
});