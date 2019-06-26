// Defines ECMAScript6 Javascript functionality that may not be supported by browsers.

// String.endsWith - from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
if (!String.prototype.endsWith) {
    Object.defineProperty(String.prototype, 'endsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (searchString, position) {
            position = position || this.length;
            position = position - searchString.length;
            var lastIndex = this.lastIndexOf(searchString);
            return lastIndex !== -1 && lastIndex === position;
        }
    });
}

if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function (searchString, position) {
      position = position || 0;
      return this.indexOf(searchString, position) === position;
    }
  });
}

// Other utility functions taken from various places

// From http://james.padolsey.com/javascript/wordwrap-for-javascript/
function wordwrap( str, width, brk, cut ) 
{
    brk = brk || '\n';
    width = width || 75;
    cut = cut || false;
 
    if (!str) { return str; }
 
    var regex = '.{1,' +width+ '}(\\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\\S+?(\\s|$)');
    return str.match( RegExp(regex, 'g') ).join( brk ); 
}

// From: http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
// Note: this code assumes that all object structures are acyclic.
function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

// Removes the first instance of the specified item from array, if it is present.
// Based on http://stackoverflow.com/questions/5767325/remove-specific-element-from-an-array
function removeFromArray(array, item)
{
	var index = array.indexOf(item);
	if (index > -1) {
	    array.splice(index, 1);
	}
}

// From: http://stackoverflow.com/questions/3614212/jquery-get-html-of-a-whole-element
jQuery.fn.outerHTML = function() 
{
	return jQuery('<div />').append(this.eq(0).clone()).html();
};
