/**
 * This class manages a list of Firebase elements and dispatches items in it to 
 * be processed. It is designed to only process one item at a time. 
 *
 * It uses transactions to grab queue elements, so it's safe to run multiple
 * workers at the same time processing the same queue.
 *
 * @param queueRef A Firebase reference to the list of work items
 * @param processingCallback The callback to be called for each work item
 */
function DistributedWorker(workerID, queueRef, processingCallback) {
	
	this.workerID = workerID;
	
	// retrieve callback
	this.processingCallback = processingCallback; 
	
	// start busy as FALSE
	this.busy = false;
	
	// every time at queueRef one child is added
	// retrieve the item and try to process it
	queueRef.startAt().limit(1).on("child_added", function(snapshot) {
		this.currentItem = snapshot.ref();
		this.tryToProcess();
	}, this);
	
}

//reset busy flag and try again to process
DistributedWorker.prototype.readyToProcess = function() {
	this.busy = false;
	this.tryToProcess();
};

// executes the transaction to pop() an
// object from the firebase queue
DistributedWorker.prototype.tryToProcess = function() {

	if(!this.busy && this.currentItem) {

		//local vars
		var dataToProcess = null,
		    self = this,
		    toProcess = this.currentItem;

		// set busy to true and initialize current item
		this.busy = true;
		this.currentItem = null;

		// start the firebase transaction
		toProcess.transaction(function(theItem) {

			// copy the retrieved item to dataToProcess
			dataToProcess = theItem;

			if(theItem) return null;
			else        return;

		}, function(error, committed, snapshot) { // on transaction complete

			if (error) throw error;

			if(committed) { // if transaction committed 
				//execute callback and after again ready to process
				self.processingCallback(dataToProcess, function() {
					self.readyToProcess();
				});

			} else {
				self.readyToProcess();
			}

		});
	}
};
