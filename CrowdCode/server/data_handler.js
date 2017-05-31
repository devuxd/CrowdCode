var fs = require('fs');
var global_data = fs.readFileSync('./FindAndReplace.java');

var change = module.exports = {
    getData: function(){
        return global_data;
},
    setData: function(content){
        global_data = content;
    }
}