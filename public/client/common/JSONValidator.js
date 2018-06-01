/*
 *  A JSONValitator provides a way to validate json texts.
 *
 */

function JSONValidator() {
  // private variables
  var text;
  var isValidParam;
  var paramType; // String indicating type of parameter
  var errors = [];
  var nameToADT = [];

  this.initialize = function(myNameToAdt, myText, myParamType) {
    text = myText
    nameToADT = myNameToAdt; //
    paramType = myParamType;

    isValidParam = false;
  };

  this.isValid = function() {
    return isValid();
  };
  this.errorCheck = function() {
    return errorCheck();
  };
  this.getErrors = function() {
    return errors;
  };

  // Returns true iff the text contained is currently valid
  function isValid() {
    return isValidParam;
  }

  function errorCheck() {
    errors = [];

    // wrap the value as an assignment to a variable, then syntax check it
    var stmtToTest = 'var stmt = ' + text + ';';
    if (!JSHINT(stmtToTest, getJSHintGlobals()))
      errors.concat(checkForErrors(JSHINT.errors));

    // If there are no syntax errors, check the structure.
    if (errors == "") {
      try {
        errors = checkStructure(JSON.parse(text), paramType);
      } catch (e) {
        if (e.message != 'Unexpected token o')
          errors.push(e.message);

        // We can get an error here if the 1) field names are not surrounded by double quotes, 2) there's a trailing ,
        // Also need to check that strings are surrounded by double quotes, not single quotes....
        // errors.push("1) property names are surrounded by double quotes");
        // errors.push("2) strings are surrounded by double quotes not by single quotes" );
        // errors.push("3) there are no trailing commas in the list of fields.");
      }
    }

    isValidParam = (errors.length == 0) ? true : false;
  }

  // Checks that the provided struct is correctly formatted as the type in typeName.
  // Returns an empty string if no errors and an html formatted error string if there are.
  function checkStructure(struct, typeName, level) {
    if (struct === null) {
      // null is an accepted value for any field
    } else if (typeName == 'String') {
      if (typeof struct != 'string')
        errors.push("'" + JSON.stringify(struct) + "' should be a String, but is not");
    } else if (typeName == "Number") {
      if (typeof struct != 'number')
        errors.push("'" + JSON.stringify(struct) + "' should be a Number, but is not");
    } else if (typeName == "Boolean") {
      if (typeof struct != 'boolean')
        errors.push("'" + JSON.stringify(struct) + "' should be a Boolean, but is not");
    }
    // Recursive case: check for typeNames that are arrays
    else if (typeName.endsWith("[]")) {
      // Check that struct is an array.
      if (Array.prototype.isPrototypeOf(struct)) {
        // Recurse on each array element, passing the typename minus the last []
        for (var i = 0; i < struct.length; i++) {
          errors.concat(checkStructure(struct[i], typeName.substring(0, typeName.length - 2), level + 1));
        }
      } else {
        errors.push("'" + JSON.stringify(struct) + "' should be an array, but is not. Try enclosing the value in array bracks ([]).");
      }
    }
    // Recursive case: typeName is an ADT name. Recursively check that
    else if (nameToADT.hasOwnProperty(typeName)) {
      if (typeof struct == 'object') {
        var typeDescrip = nameToADT[typeName].structure;
        var typeFieldNames = [];

        // Loop over all the fields defined in typeName, checking that each is present in struct
        // and (recursively) that they are of the correct type.
        for (var i = 0; i < typeDescrip.length; i++) {
          typeFieldNames.push(typeDescrip[i].name);

          var fieldName = typeDescrip[i].name;
          var fieldType = typeDescrip[i].type;


          if (struct.hasOwnProperty(fieldName))
            errors.concat(checkStructure(struct[fieldName], fieldType, level + 1));
          else
            errors.push("'" + JSON.stringify(struct) + "' is missing the required property " + fieldName);
        }

        // Loop over all the fields defined in the struct, checking that each
        // is part of the data type
        var structFieldNames = Object.keys(struct);
        for (var f = 0; f < structFieldNames.length; f++)
          if (typeFieldNames.indexOf(structFieldNames[f]) == -1)
            errors.push("'" + structFieldNames[f] + "' is not a field of the data type " + typeName);

      } else {
        errors.push("'" + JSON.stringify(struct) + "' is not an " + typeName);
      }
    } else {
      errors.push("Internal error - " + typeName + " is not a valid type name");
    }

    return errors;
  }
}
