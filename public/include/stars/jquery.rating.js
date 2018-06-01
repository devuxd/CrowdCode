jQuery.fn.ratings = function(stars, initialRating) {

	// reset button
	var reset;

	//Save  the jQuery object for later use.
	var elements = this;

	//Go through each object in the selector and create a ratings control.
	return this.each(function() {

		//Make sure intialRating is set.
		if(!initialRating)
			initialRating = 0;

		//Save the current element for later use.
		var containerElement = this;
		
		//grab the jQuery object for the current container div
		var container = jQuery(this);

		//Create an array of stars so they can be referenced again.
		var starsCollection = Array();

		//Save the initial rating.
		containerElement.rating = initialRating;
		
		//Set the container div's overflow to auto.  This ensure it will grow to
		//hold all of its children.
		container.css('overflow', 'auto');

		//create each star
		for(var starIdx = 0; starIdx < stars; starIdx++) {

			//Create a div to hold the star.
			var starElement = document.createElement('div');

			//Get a jQuery object for this star.
			var star = jQuery(starElement);

			//Store the rating that represents this star.
			starElement.rating = starIdx + 1;

			//Add the style.
			star.addClass('jquery-ratings-star');

			//Add the full css class if the star is beneath the initial rating.
			if(starIdx < initialRating) {
				star.addClass('jquery-ratings-full');
			}

			//add the star to the container
			container.append(star);
			starsCollection.push(star);

			// add the reset button
			if(starIdx == stars - 1)
			{
				var resetButton = document.createElement('div');
				resetButton.setAttribute("id","reset");
				//Get a jQuery object for this star.
				reset = jQuery(resetButton);
				container.append(reset);
				var text = document.createElement('div');

				text.setAttribute("id","borderTextReject");
				text = jQuery(text);
				text.text("Reject");
				var text2 = document.createElement('div');

				text2.setAttribute("id","borderTextAccept");
				text2 = jQuery(text2);
				text2.text("Accept");
				container.append(text);
				container.append(text2);
			}

			// add the dotted separator between 3 and 4
			if(starIdx == 2)
			{
				//debugger;
				var dottedLine = document.createElement('div');

				dottedLine.setAttribute("id","dotted");
				dottedLine = jQuery(dottedLine);
				dottedLine.addClass('jquery-ratings-star');
				container.append(dottedLine);
			}


			//hook up the click event
			star.click(function() {
				//set the containers rating
				containerElement.rating = this.rating;
				//When clicked, fire the 'ratingchanged' event handler.  
				//Pass the rating through as the data argument.
				elements.triggerHandler("ratingchanged", {rating: this.rating});
			});

			star.mouseenter(function() {
				//Highlight selected stars.
				for(var index = 0; index < this.rating; index++) {
					starsCollection[index].addClass('jquery-ratings-full');
				}
				//Unhighlight unselected stars.
				for(var index = this.rating; index < stars; index++) {
					starsCollection[index].removeClass('jquery-ratings-full');
				}
			});

			if(starIdx == stars -1)
			{
				reset.click(function(){
					// put all the scores back to zero
					for(var index = 0; index < stars ; index++) {
						starsCollection[index].removeClass('jquery-ratings-full');
					}
					elements.triggerHandler("ratingchanged", {rating:"not set"});
					containerElement.rating = initialRating;

				});
			}

			star.mouseleave(function() {
				//Highlight selected stars.
				for(var index = 0; index < containerElement.rating; index++) {
					starsCollection[index].addClass('jquery-ratings-full');
				}
				//Unhighlight unselected stars.
				for(var index = containerElement.rating; index < stars ; index++) {
					starsCollection[index].removeClass('jquery-ratings-full');
				}
			});

		}
	});
};