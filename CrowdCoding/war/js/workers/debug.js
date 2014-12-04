function Debug() {
	this.messages = [],
	this.log = function(statement){
		this.messages.push( "> " + statement );
	}
}


