<html>
<head>
	<title></title>
	<script type="text/javascript" src="https://code.jquery.com/jquery-2.1.3.min.js"></script>
</head>
<body>
	<canvas id="canvas" width="1400" height="730" style="border:1px solid black"></canvas>
</body>

<script type="text/javascript">

var colors  = { 
               "WriteFunction": '#F68E55',
               "WriteTestCases": '#C4DF9B',
               "Review": '#6ECFF6',
               "WriteTest": '#A187BE',
               "DebugTestFailure": '#C69C6E',
               "ReuseSearch": '#8493CA',
               "WriteCall": '#8493CD'
              };

var w = 800, h = 400;
var its = [ 
  { type: 'WriteTestCases', slot: 0 },
  { type: 'WriteFunction', slot: 0 },
  { type: 'Review', slot: 14 },
  { type: 'WriteTestCases', slot: 17 },
  { type: 'Review', slot: 19 },
  { type: 'Review', slot: 19 },
  { type: 'WriteFunction', slot: 20 },
  { type: 'Review', slot: 25 },
  { type: 'WriteFunction', slot: 26 },
  { type: 'WriteTestCases', slot: 27 },
  { type: 'WriteTestCases', slot: 28 },
  { type: 'Review', slot: 31 },
  { type: 'ReuseSearch', slot: 32 },
  { type: 'WriteCall', slot: 36 },
  { type: 'Review', slot: 37 },
  { type: 'WriteFunction', slot: 38 },
  { type: 'Review', slot: 41 },
  { type: 'Review', slot: 42 },
  { type: 'ReuseSearch', slot: 42 },
  { type: 'WriteCall', slot: 51 },
  { type: 'WriteTestCases', slot: 52 },
  { type: 'Review', slot: 53 },
  { type: 'WriteFunction', slot: 53 },
  { type: 'Review', slot: 55 },
  { type: 'Review', slot: 57 },
  { type: 'DebugTestFailure', slot: 57 },
  { type: 'DebugTestFailure', slot: 60 },
  { type: 'DebugTestFailure', slot: 62 } 
];

$(document).ready(function() {
    var d_canvas = document.getElementById('canvas');
    var ctx = d_canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(10,h/2);
    ctx.moveTo(w-10,h/2);
    ctx.strokeStyle="black";
    ctx.stroke();

    /*

    ctx.fillStyle = "black";
	ctx.font      = "bold 12px Arial";
	ctx.fillText( '* - API functions' , posX, posY) ;


    posX = offX + 200*3;
    posY = 6;
    // workers legend
	ctx.font      = "bold 12px Arial";
    for( var workerId in colors ){
    	ctx.fillStyle = colors[workerId];
	    ctx.fillRect( posX, posY, 10, 10); 
		ctx.fillStyle = "black";
		ctx.fillText( 'worker'+n , posX + 15, posY + 8) ;
		posX += 180;
		if( n % 3 == 0 ) { posX = offX  + 200*3; posY += 20; }
		n++;
    }
	

    // time indicators
    var offY = 60;
	for( var time = 0; time <= max; time += 5*60 ){
		ctx.beginPath();
		var x = getX( time );
      	ctx.moveTo( x, offY);
      	ctx.lineTo( x, offY+ 12* 5*h);
      	ctx.strokeStyle="lightgray";
      	ctx.stroke();

      	if( time % (30*60) == 0) {
      		ctx.fillStyle = "black";
			ctx.font      = "bold 10px Arial";
			// ctx.rotate(Math.PI/2);
			var hours = Math.floor(time / (60 * 60));
		    var divisor_for_minutes = time % (60 * 60);
		    var minutes = Math.floor(divisor_for_minutes / 60);
		    if( minutes < 10 ) minutes = "0"+minutes;

			ctx.fillText( hours+':'+minutes , x - 10, offY + 12*5*h + h) ;
			// ctx.rotate(-Math.PI/2);
      	}
	}

    line = 0;
    var linkFrom = {};
    var linkTo   = {};
    for( var o = 0; o < ordered.length ; o++ ){
    	var fName = ordered[o];

    	ctx.fillStyle = "black";
    	ctx.textAlign = "right"; 
		ctx.font      = "bold 12px Arial";
		ctx.fillText( ( apiFuncts.indexOf(fName) > -1 ? '*': '') + fName , 130, offY + 2.5*h) ;

    	ctx.textAlign = "left"; 
    	for( var t=0; t < types.length; t++){
			var y = h*(t+1) - 2; 
	    	ctx.fillStyle = "black";
	    	ctx.textAlign = "left";
			ctx.font      = "bold 10px Arial";
			ctx.fillText( shortTypes[ t ] ,  150, offY + y) ;		
		}

		var points = [];

		if( apiFuncts.indexOf( fName ) > -1 )
			points.push( { x: offX, y: offY + (3*h/6) } );

		// first cycle for iterations, draw the background rectangles
		var it = its[fName];
    	for( i = 0 ; i < it.length ; i++ ){
	        var ite = it[i];
	        var line = 1; //types.indexOf( ite.type );
	        var color = colors[ ite.workerId ];
	        var fromX = getX( ite.startedAt );
	        var width = getX( ite.endedAt ) - fromX;

	        if( width < 1 ) width = 5;

			ctx.fillStyle= color;
        	ctx.fillRect( fromX, offY , width, h*5); 
			

	        if( ite.type == 'ReuseSearch' && ite.pseudo !== undefined ){
	        	linkFrom[ ite.pseudo ] = { x: fromX + width, y: offY + h*2.5 };
	        }

	        if( ite.type == 'WriteFunctionDescription'){
	        	linkTo[ ite.pseudo ] = { x: fromX, y: offY + h*2.5 };
	        }


	        var t = types.indexOf( ite.type );
	        var y1 = offY + h*t + h/2;

	        points.push( { x: fromX, y: y1 } );
	        points.push( { x: fromX + width, y: y1 } );

			// ctx.fillRect( from, offY + y - h, to-from, h); 
	        
	        
	    }
    	offY += h*5;


    	// evolving curve
		ctx.beginPath();
		ctx.moveTo( points[0].x, points[0].y );
    	for( var p = 0 ; p < points.length ; p++ )
    		ctx.lineTo( points[p].x, points[p].y );
	  	ctx.strokeStyle="gray";
	  	ctx.stroke();

    }

	// link curves 
  	for( var fName in linkFrom ){

  		if( linkTo[fName] !== undefined ){
  			var from = linkFrom[fName];
  			var to = linkTo[fName];

  			ctx.beginPath();
		  	ctx.strokeStyle="#736357";
  			if( to.x - from.x < 20 ){
  				// one control point
  				var c = { x: from.x - 20, y: from.y + (to.y - from.y)/2};
  				ctx.moveTo( from.x, from.y );
  				ctx.quadraticCurveTo( c.x, c.y, to.x, to.y );
  			} else {
  				// two control points
  				var midX = from.x + (to.x - from.x) / 2;
  				var midY = from.y + (to.y - from.y) / 2;
				ctx.moveTo(from.x, from.y);
				ctx.quadraticCurveTo(midX,from.y,midX,midY);
				ctx.quadraticCurveTo(midX,to.y, to.x,to.y);
  			}
		  	ctx.stroke();
  			
  		}
  	}
  	

  	ctx.strokeStyle="black";

  	// horizontal grid
  	ctx.beginPath();
  	ctx.moveTo(0, 45);
  	ctx.lineTo(maxX, 45);
  	ctx.stroke();

    offY = 60;
    for( var o = 0; o <= ordered.length ; o++ ){
		ctx.beginPath();
	  	ctx.moveTo(0, offY);
	  	ctx.lineTo(maxX, offY);
  		ctx.stroke();
	  	offY += h*5;
	}


	// vertical bounds
  	ctx.moveTo(1, 45);
  	ctx.lineTo(1, offY - h*5);

  	ctx.moveTo( 135, 45);
  	ctx.lineTo( 135, offY - h*5);

  	ctx.moveTo( offX, 45);
  	ctx.lineTo( offX, offY - h*5);


  	ctx.moveTo( maxX, 45);
  	ctx.lineTo( maxX, offY - h*5);

  	ctx.strokeStyle="black";
  	ctx.stroke();

  	// labels
  	ctx.fillStyle = "black";
	ctx.textAlign = "left"; 
	ctx.font      = "bold 10px Arial";
	ctx.fillText( 'functions' , 50, 56 ) ;


  	ctx.fillStyle = "black";
	ctx.textAlign = "left"; 
	ctx.font      = "bold 10px Arial";
	ctx.fillText( 'task type' , 140, 56 ) ;
    
    

  	ctx.fillStyle = "black";
	ctx.textAlign = "center"; 
	ctx.font      = "bold 11px Arial";
	ctx.fillText( 'time - hh:mm' , maxX/2 , offY - 2.5*h ) ;
    */
});


</script>
</html>