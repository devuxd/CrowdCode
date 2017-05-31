var fs = require('fs');
var file_contents = fs.readFileSync('./FindAndReplace.java');

var change = module.exports = {
            global_data: {
                data: file_contents,

                getData:function(){
                    return this.data;
                },
                setData: function(content){
                   this.data = content;
                }
                }
            }
