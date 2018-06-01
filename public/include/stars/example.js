// to change the number stars we need to match the id tag then change rating inside parenthesis
//  $('#id').ratings(NUM).bind('ratingchanged', function(event, data) {
 //    $('#example-rating-1').text(data.rating);
 //  });
$(document).ready(function() {
   $('#quality').ratings(7).bind('ratingchanged', function(event, data) {
     $('#quality-rating').text(data.rating);
	console.log(data);
   });
   
  $('#contrib').ratings(7).bind('ratingchanged', function(event, data) {
     $('#contrib-rating').text(data.rating);
   });
 });