var firebaseUrl = 'https://crowdcode.firebaseio.com/development/mvc';
var fbRef = new Firebase(firebaseUrl);


var frame = null;
var activePartial = 'main';

var apiCode = '';
var partials = [];

var htmlEditor = ace.edit('htmlEditor');
var jsEditor   = ace.edit('jsEditor');
var apiEditor  = ace.edit('apiEditor');
var testSetupEditor   = ace.edit('testSetupEditor');
var testItEditor  = ace.edit('testItEditor');

jQuery(function($){
	
	frame     = parent.$("#frame")[0].contentWindow;

	htmlEditor.getSession().setMode("ace/mode/html");
	htmlEditor.setTheme("ace/theme/xcode");

	jsEditor.getSession().setMode("ace/mode/javascript");
	jsEditor.setTheme("ace/theme/xcode");

	testSetupEditor.getSession().setMode("ace/mode/javascript");
	testSetupEditor.setTheme("ace/theme/xcode");

	testItEditor.getSession().setMode("ace/mode/javascript");
	testItEditor.setTheme("ace/theme/xcode");

	apiEditor.getSession().setMode("ace/mode/javascript");
	apiEditor.setTheme("ace/theme/xcode");

	$('#run').on('click',function(){ 
		savePartial(); 
		firebaseSave();
		
		frame.location.reload();
		
		setTimeout(function(){
			frame.run(apiEditor.getValue(),partials);
		},500);
	});

	$('#runTest').on('click',function(){ 

		savePartial();
		firebaseSave();


		var itBlocks = [{
			description: 'provait',
			code: testItEditor.getValue()
		}];
		var setupCode = testSetupEditor.getValue();


		frame.location.reload();
		
		setTimeout(function(){
			frame.run(apiEditor.getValue(),partials);

			frame.runTest('test di prova',setupCode,itBlocks,function(results){
				console.log('TESTS RESULT');
				results.forEach( function( result ){
					console.log(result.title, result.state);
				});
			});
		},500);
	
	});

	firebaseLoad(function(){
		editPartial('main');
		frame.run( apiCode, partials );
	});		
});




function firebaseSave(callback){
	fbRef.child('partials').set(partials,function(error){

		refreshPartialDropdown();
		if( callback )
			callback.apply();
	});

	fbRef.child('api').set(apiEditor.getValue());

	fbRef.child('test').set({
		setup: testSetupEditor.getValue(),
		it   : testItEditor.getValue()
	});
}

function firebaseLoad(callback){
	fbRef.child('api').once('value',function(snap){
		apiCode = snap.val();
		apiEditor.setValue( snap.val() );

		fbRef.child('partials').once('value',function(snap){
			partials = snap.val();
			refreshPartialDropdown();
			
			fbRef.child('test').once('value',function(snap){
				var test = snap.val();

				if( test != null ){
					testSetupEditor.setValue( test.setup );
					testItEditor.setValue( test.it );
				}
				

				if( callback ) 
					callback.apply();
			});
		});
	});
}

function refreshPartialDropdown(){
	var $partialDropdown = $('#partialDropdown');
	$partialDropdown.html('');
	for( var partialId in partials ){
		var $newItem = $('<li><a href="#" onclick="editPartial(\''+partialId+'\')">'+partialId+'</a></li>');
		$partialDropdown.append($newItem);
	}
}

function savePartial(){
	partials[ activePartial ].template    = htmlEditor.getValue();
	partials[ activePartial ].constructor = jsEditor.getValue();

	$partial = $('<div></div>').html( partials[ activePartial ].template );

	$partial.find('partial').each(function( index, item ){
		var id = $(item).attr('id');
		if( ! partials[id] ){
			partials[id] = {
				path: partials[ activePartial ].path+'/'+id,
				name: id,
				template: '<div> template for partial '+(partials[ activePartial ].path+'/'+id)+'</div>',
				constructor: '// constructor code for partial '+id
			};
		}
	});
}

function editPartial(partialId){
	htmlEditor.setValue( partials[partialId].template );
	jsEditor.setValue( partials[partialId].constructor );

	// frame.highlightPartial(activePartial, true);
	// frame.highlightPartial(partialId);

	activePartial = partialId;
}







/* 
// SEE THE LIBRARY AT https://github.com/hmert/jquery-event-playback 

var historyLog = [];
function historyClickHandler(e){
	console.log(packFrame(e));
	historyLog.push({ event: e, element: $(this)[0] });
	e.stopPropagation();
}
function historyKeydownHandler(e){
	console.log(packFrame(e));
	historyLog.push({ event: e, element: $(this)[0] });
	e.stopPropagation();
}

function historyStart(){
	historyLog = [];
	var $app = $('#'+appId);
	$app.on('click','*',historyClickHandler);
	$app.on('keydown','*',historyKeydownHandler);
}

function historyStop(){
	var $app = $('#'+appId);
	$app.off('click','*',historyClickHandler);
	$app.off('keydown','*',historyKeydownHandler);
}

function historyReplay(){
	for( var h = 0; h < historyLog.length ; h++ ){
		var his = historyLog[h];
		console.log(h,his);
		var e = null;

		// if( his.action == 'click' )
		// 	e = jQuery.Event('click');
		// else if( his.action == 'keydown' ){
		// 	e = jQuery.Event('keydown');
		// 	e.which = his.key;
		// }

		his.element.trigger(his.event);
	}
}
*/

