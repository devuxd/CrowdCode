function allDifferent(vertices) {
	
	if(vertices === null) {
	    throw "Input, vertices, points to a null reference!";
	}
	
	if(vertices !== null && vertices.length === 0 )
	    return true;
	    
    for(var i = 0; i < vertices.length - 1; i++) {
        for(var j = i + 1; j < vertices.length; j++) {
            if((vertices[i].x === vertices[j].x) && (vertices[i].y === vertices[j].y))
                return false;
        }
    }
    
	
	return true;
} 
  
function createAction(mouseDownPos, command, elements) {
    if(isInvalidPosition(mouseDownPos)) {
        return null;
    }
    
    if(isInvalidCommand(command)) {
        return null;
    }
    
    if(elements === null) {
        return null;
    }
    
    var elem, action;
    
    if (command == 'Move'){
        elem = firstElemInPosition(elements, mouseDownPos);
        if (elem == null){
            return null;
        } else {
            action =
            {
                "type": "Move", "elementId": elem.id, "mouseDownPos": mouseDownPos     
            };
        }
        
    } else {
        action =
        {
            "type": command, "elementId": getNextValidId(elements), "mouseDownPos": mouseDownPos     
        };
    }
    return action;
} 
function renderDrawing(elements) {
	
	var segments = [];
	var elementSegments = [];
	
	if(elements === null) {
	    return segments;
	}
	
	for(var i = 0; i < elements.length; i++){
	    var element = elements[i];
	    
	    if(element === null) {
	        return segments;
	    }
	    
	    
	    //test elements 
	    // for(var i = 0; i < elements.length; i++){
	    //     if( !isValidElement(elements[i])){
	    //         return null;
	    //     }
	    // }
	    
	    
	    if(element.type == "Rectangle"){
            elementSegments.push({from: element.vertices[0], to:element.vertices[1]});
            elementSegments.push({from: element.vertices[1], to:element.vertices[2]});
            elementSegments.push({from: element.vertices[2], to:element.vertices[3]});
            elementSegments.push({from: element.vertices[3], to:element.vertices[0]});
	    } else if(element.type == "Freehand") {
             for(var j = 0; j < element.vertices.length - 1; j++){
                 // if( i === elements.length -1 )
                    elementSegments.push({from: element.vertices[j], to:element.vertices[j+1]});
                 // else
                    // elementSegments.push({from: element.vertices[i], to:element.vertices[i+1]});
             }
                
	  //    elementSegments[i].from.x = element.vertices[i].x;
	  //    elementSegments[i].from.y = element.vertices[i].y;
	    } else if(element.type == "Line") {
	        elementSegments.push({from: element.vertices[0], to:element.vertices[1]});
	    } else {
	        return null;
	    }
	    
	    for(var j = 0; j < elementSegments.length; j++){
	        segments.push(elementSegments[j]);
	    }

	}
	
    return segments;
} 
function isInvalidCommand(command) {
    
    if( command === null || command.length === 0)
        return true;
    
    if(command === "Move") {
        return false;
    }
    if(command === "Line")
        return false;
    if(command === "Freehand")
        return false;
    if(command === "Rectangle")
        return false;
        
    return true;
} 
function createElement(id, type, mouseDownPos, mouseCurrPos, prevElement) {
	
	var element = {};
	
	if(typeof(id) == 'number'){
	    element.id = id;
	    //we check afterwards if type is an acceptable value, 
	    element.type = type;
        element.vertices = [];
	} else {
	    return null;
	}
	
	
	if(type == "Line") {
	    element.vertices.push(mouseDownPos);
	    element.vertices.push(mouseCurrPos);
	} else if(type == "Rectangle") {
	    //set vertices of rectangle
	    element.vertices.push(mouseDownPos);
	    element.vertices.push({x: mouseCurrPos.x, y: mouseDownPos.y});
	    element.vertices.push(mouseCurrPos);
	    element.vertices.push({x: mouseDownPos.x, y: mouseCurrPos.y});
	} else if(type == "Freehand") {
	    //set vertices of a freehand
	    if(prevElement!=null){
            element.vertices = prevElement.vertices;
	    } else  {
	        //the first 'freehand' segment it is just a line
	        element.vertices.push(mouseDownPos);
	        //element.vertices.push(mouseCurrPos);
	    }
	    element.vertices.push(mouseCurrPos);
	} else {
	    return null;
	}
	
	
    return element;
} 
function isValidElement(anElement) {
	if(anElement.type !== "Line" 
	    && anElement.type !== "Freehand" 
	    && anElement.type !== "Rectangle")
	    return false;
	
	if (anElement.type === "Line" 
	    && anElement.vertices.length === 2){
	        // if (allDifferent(anElement.vertices)){
	            return true;
	        // }
	       
	}
	
	if (anElement.type === "Rectangle"){
	    if (anElement.vertices.length === 4){
	       // if (allDifferent(anElement.vertices)){
	            return true;
	       // }
	        
	   
	      //the first vertex might be any of the 4 vertices, depending on how the user made it
	      //we need to understand which one it is, and to chek if the other vectices are 
	      //in a allowed position
	      
	      if(anElement.vertices[0].x === anElement.vertices[1].x){
	          if(
	            (anElement.vertices[2].x === anElement.vertices[3].x) &&
	            (anElement.vertices[0].y === anElement.vertices[3].y) &&
	            (anElement.vertices[1].y === anElement.vertices[2].y) && 
	            (anElement.vertices[0].x < anElement.vertices[1].x) &&
	            (anElement.vertices[2].x > anElement.vertices[3].y)
	            ){
	                return true;
	          } else {
	              return false;
	          }
	      } else if(anElement.vertices[0].y === anElement.vertices[1].y){
	          //#same as above
	          
	           if(
	            (anElement.vertices[2].y === anElement.vertices[3].y) &&
	            (anElement.vertices[0].x === anElement.vertices[3].x) &&
	            (anElement.vertices[1].x === anElement.vertices[2].x) && 
	            (anElement.vertices[0].y < anElement.vertices[1].y) &&
	            (anElement.vertices[2].y > anElement.vertices[3].x)
	            ){
	                return true;
	          } else {
	              return false;
	          }
	          
	          
	      } else {
	          return false;
	      }
	      
	    }    
	}
	
	if(anElement.type === "Freehand") {
	    // not checking for allDifferent because,
	    // i imagine that you can have overlapping/same points or vertices
	    // in a freehand drawing.
	    return true; 
	}
	
    return false;
} 
function isInvalidPosition(mousePosition) {
    
    if (mousePosition === null) return true;
    
    if((mousePosition.x < 0) || (mousePosition.y < 0)) {
	    return true;
	} else {
	    return false;
	}
} 
function getSecondEssentialPosition(element) {
	
	if(element === null || element.length === 0) {
	    return null;
	}
	
	if(element.type==="Line") {
	    return element.vertices[1];
	} else if(element.type==="Rectangle") {
	    return element.vertices[3];
	} else {
	    return null;
	}
} 
function moveElement(mouseDownPos, mouseCurrPos, origElem) {
	
	var xOffset = mouseCurrPos.x - mouseDownPos.x;
	var yOffset = mouseCurrPos.y - mouseDownPos.y;
	for (var i = 0; i < origElem.vertices.length; i += 1) {
	    origElem.vertices[i].x += xOffset;
	    origElem.vertices[i].y += yOffset;
	}
    return origElem;
} 

function getNextValidId(elements) {
    if(elements.length === 0){
        return 0;
    }
	var maxId = 0;
	for (var i = 0; i < elements.length; i += 1) {
    	maxId = Math.max(maxId, elements[i].id);
	}
	return maxId + 1;
} 
function firstElemInPosition(elements,position) {
    for (var el in elements) 
        if (isOnOutline(position, elements[el])) 
            return elements[el];
    console.debug("no elements")
    return null;
}
function isOnOutline(position, element) {
	console.log("IsOnOutline "+JSON.stringify(position)+" / "+JSON.stringify(element));
    if (isInvalidPosition(position)) {
    	console.error("Invalid position!");
        return false;
    }
    // check for bogus elements
    if (!isValidElement(element)) {
    	console.error("Invalid element!",element);
        return false;
    }
    
	if (element.type == "Line") {
	    return positionIsOnSegment(position, {"from": element.vertices[0], "to": element.vertices[1]});
	} else if(element.type == "Rectangle"){
	    return isInRectangle(position, element);
	} else if(element.type == "Freehand"){
	    for(var i = 0;i<element.vertices.length-1;i++) {
	        if (positionIsOnSegment(position, 
	        {"from": element.vertices[i], "to": element.vertices[(i+1)]})) {
	            return true;
	        }
	    }
	} else{
	    return false;
	}
} 
function isInRectangle(position,el){
	if(position.x < el.vertices[0].x || position.x > el.vertices[2].x ||
	   position.y < el.vertices[1].y || position.y > el.vertices[3].y)
	    return false;
	return true;
}
function positionIsOnSegment(position, segment) {
	var ax = position.x, ay = position.y;
	var bx = segment.from.x, by = segment.from.y;
	var cx = segment.to.x, cy = segment.to.y;
	var lenght=Math.sqrt(Math.pow(cx-bx,2) + Math.pow(cy-by,2));
	var dotPoint= Math.abs((cx-bx)*(by-ay)-(bx-ax)*(cy-by) );
	return dotPoint/lenght <1;
} 