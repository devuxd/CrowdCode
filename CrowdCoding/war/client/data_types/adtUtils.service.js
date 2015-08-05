////////////////////
//ADT SERVICE   //
////////////////////
angular
    .module('crowdCode')
    .factory('AdtUtils', [ 'AdtService', function(AdtService) {

	return {
        parse               : parse,
        validate            : validate,
        isValidName         : isValidName,
    };


    function parse(){

    }

    function validate(stringValue,type,name){
                // avoids jshint entering in json mode
        code = 'var _value = '+stringValue+';';

        var data = {};
        data.errors = [];

        var lintResult = JSHINT(code,{latedef:false, camelcase:true, undef:true, unused:false, boss:true, eqnull:true,laxbreak:true,laxcomma:true,smarttabs:true,shadow:true,jquery:true,worker:true,browser:true});

        //console.log('linting '+lintResult);
        // if the linting failed
        if( !lintResult ) {
            data.errors = data.errors.concat(checkForErrors(JSHINT.errors));
        } 
        // otherwise check the structure
        else {
            eval(code);
            // validate the structure
            data.errors = validateStructure(_value, type, name).concat(data.errors);
        }

        return data;
    }

    function validateStructure(value,expectedType,name){

        // if it's a simple data type
        var errors = [];
        var dataType = getNameAndSuffix(expectedType);

        // if the expected type is an array
        if( dataType.suffix.length > 0 ){
            // if is an instance of array, validate each element
            if( value instanceof Array ){
                for( var i = 0; i < value.length ; i++ ){
                    errors = validateStructure(value[i], dataType.name, "element "+i).concat(errors);
                }
            }
            else {
                errors.push( name + " should be an array and it's not!");
            }
        }
        else {
            // check the simple data types
            if( dataType.name == "String" ){ 
                if( typeof value !== 'string')
                    errors.push( name + " should be a string and it's not!");
            }
            else if( dataType.name == "Boolean"){ 
                if( typeof value !== 'boolean')
                    errors.push( name + " should be a boolean and it's not!");
            }
            else if( dataType.name == "Number"){ 
                if( typeof value !== 'number')
                    errors.push( name + " should be a number and it's not!");
            }
            // check the first layer of the complex data type
            else if( typeof value !== 'object' ){
                errors.push( name + " should be an object and it's not!")
            }
            else {
                var adt = AdtService.getByName(dataType.name);
                if( adt == null )
                    throw 'Data type '+dataType.name+' cannot be find!';

                var struct = adt.structure;
                var structProperties = [];
                for( var i = 0; i < struct.length ; i++ ){
                    var prop = struct[i];
                    structProperties.push(prop.name);
                    if( !value.hasOwnProperty(prop.name) ){
                        errors.push( name + " is missing the property " + prop.name);
                        break;
                    }
                    else {
                        errors = validateStructure(value[prop.name],prop.type,name+'.'+prop.name).concat(errors);
                    }
                }

                for( var propName in value ){
                    if( structProperties.indexOf(propName) == -1 )
                        errors.push( propName + " is not a field of the data type " + dataType.name);
                }

            }  
        }

        return errors;
    }


    function isValidName(name){      
        var dataType = getNameAndSuffix(name);

        // check if the name is one of the data types
        if ( AdtService.getAllNames().indexOf(dataType.name) == -1){
            return false;
        }
        
        // check that the dimensions is at most 4
        if ( dataType.suffix.length > 0 && ['[]', '[][]', '[][][]', '[][][][]'].indexOf(dataType.suffix) == -1 ) {
                return false;
        }

        return true;
    }

    function getNameAndSuffix(fullName){
        var suffixIndex = fullName.indexOf('[]');
        return {
            name    : suffixIndex == -1 ? fullName : fullName.substring(0,suffixIndex),
            suffix  : suffixIndex == -1 ? "" : fullName.substring(suffixIndex) 
        };
    }
}]);
