importScripts('chai.js'); 

self.addEventListener('message', function(e) {
 
  var a = JSON.parse( e.data );
  console.log(a);
  // var expect = chai.expect; 
  // var assertions = JSON.parse( e.data );

  // for(var i = 0; i < assertions.length; i++){
  //   try {
  //     eval(assertions[i].code);
  //     assertions[i].passed = true;
  //   } catch( e ){
  //     assertions[i].result = e;
  //     assertions[i].passed = false;
  //   }
  // }

  // self.postMessage( JSON.stringify( assertions ) );
 
}, false);

