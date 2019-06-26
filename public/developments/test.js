
var expect = require('expect.js');
  
describe('something', function(){
  this.timeout(500);

  it('should take less than 500', function(done){
    setTimeout(done, 300);
    loop();
  });

  it('should take less than 500 too', function(done){
    setTimeout(done, 200);
  });
})

function loop(){
	while(1);
	return 5;
}