var Firebase = require("firebase");
var fs = require("fs");
var jsdiff = require('diff');



var functRef1     = new Firebase('https://crowdcode.firebaseio.com/projects/allTogetherDrawV9/artifacts/functions');
var functRef2     = new Firebase('https://crowdcode.firebaseio.com/projects/allTogetherDrawV10/artifacts/functions');
var testsRef1     = new Firebase('https://crowdcode.firebaseio.com/projects/allTogetherDrawV9/artifacts/tests');
var testsRef2     = new Firebase('https://crowdcode.firebaseio.com/projects/allTogetherDrawV10/artifacts/tests');

var deleted1 = [4645816195088384,4675450395688960,4695001086820352,4722369692172288,4764400913219584,4830789430673408,4902396467609600,5071437253574656,5094632358674432,5096168749006848,5259564874203136,5379137837465600,5458244961042432,5634387206995968,5666823336886272,5700735861784576,5712536552865792,5764748591235072,5803067215708160,5816005267816448,5822514827624448,6028296374452224,6169823063048192,6222068655849472,6254676047560704,6262664149860352,6492016477208576,6551957040791552];
var deleted2 = [5219614162157568,5404450495660032,5469924856168448,6235839528960000,6562441055961088];


functRef1.on('value',function(fSnap1){
	functRef2.on('value',function(fSnap2){
		testsRef1.on('value',function(tSnap1){
			testsRef2.on('value',function(tSnap2){
				
				var data1 = buildData(fSnap1,tSnap1,deleted1);
				var data2 = buildData(fSnap2,tSnap2,deleted2);

				// write csv
				var csv = "function,tests\n";

				for (var fName in data1) {
					csv += fName+','+data1[fName].written.length+','+data1[fName].deleted.length+'\n';
				}

				csv += "__,__\n";

				for (var fName in data2) {
					csv += fName+','+data2[fName].written.length+','+data2[fName].deleted.length+'\n';
				}
				
				fs.writeFile("data.csv", csv, function(err) {
					console.log(csv);
					console.log('File written.');
					process.exit();
				});


			});
		});
	});
});

function buildData(fSnap,tSnap,deleted){
	var data = {};
	fSnap.forEach(function(childSnap){
		var f = childSnap.val();
		if (data[f.name]===undefined)
			data[f.name] = { written: [],deleted:[]};
	});

	tSnap.forEach(function(childSnap){
		var t = childSnap.val();

		if( data[t.functionName] === undefined )
			console.error('FUNCTION '+t.functionName+ ' not present!');
		else
			if( deleted.indexOf(t.id) > -1 ) {
				console.warn(t.id + ' - '+ t.functionName + ' this is deleted');
				data[t.functionName].deleted.push(t.id);
			}
			else {
				data[t.functionName].written.push(t.id);
			}
	});
	return data;
}
