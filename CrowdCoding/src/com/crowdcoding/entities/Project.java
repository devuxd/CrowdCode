package com.crowdcoding.entities;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Map;
import java.util.logging.Logger;

import com.crowdcoding.commands.ADTCommand;
import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.commands.MicrotaskCommand;
import com.crowdcoding.commands.SimpleTestCommand;
import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.ClientRequestDTO;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ajax.microtask.submission.ADTDTO;
import com.crowdcoding.dto.ajax.microtask.submission.ADTStructureDTO;
import com.crowdcoding.dto.ajax.microtask.submission.FunctionDTO;
import com.crowdcoding.dto.ajax.microtask.submission.FunctionDescriptionDTO;
import com.crowdcoding.dto.ajax.microtask.submission.ImplementBehaviorDTO;
import com.crowdcoding.dto.ajax.microtask.submission.TestDTO;
import com.crowdcoding.dto.firebase.QueueInFirebase;
import com.crowdcoding.entities.artifacts.Artifact;
import com.crowdcoding.entities.microtasks.ChallengeReview;
import com.crowdcoding.entities.microtasks.ImplementBehavior;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.entities.microtasks.Review;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.history.MicrotaskAssigned;
import com.crowdcoding.history.MicrotaskDequeued;
import com.crowdcoding.history.MicrotaskQueued;
import com.crowdcoding.history.MicrotaskSubmitted;
import com.crowdcoding.history.MicrotaskUnassigned;
import com.crowdcoding.history.ProjectCreated;
import com.crowdcoding.util.FirebaseService;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.deser.DefaultDeserializationContext.Impl;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Serialize;

/*
 * Projects are the root of the artifact and microtask graphs. A project instance MUST be created before
 * any interactions with artifacts or microtasks can take place.
 */
@Entity
public class Project
{
	// The one and only project, which is always initialized in Create (which must be called first
	// when a servlet begins).
	public static Project project;

	@Id private String id;

	private Boolean reviewsEnabled = true;			// Disabling this flag stops new review microtasks from being generated
	private Boolean tutorialsEnabled = false;

	// logged in workers
	@Serialize private HashSet<String> loggedInWorkers = new HashSet<String>();

	// Global queue of microtasks waiting to be done
	private LinkedList< String > microtaskQueue = new LinkedList< String >();

	// Global queue of review microtasks waiting to be done
	private LinkedList< String > reviewQueue    = new LinkedList< String >();

	// Map from  < workerId, microtaskKey >; workers with no microtask have a null entry
	@Serialize private Map< String, String > microtaskAssignments = new HashMap<String, String >();

	// Workers that are currently excluded from doing the microtask. This set may change over time as workers
	// skip and this count is reset. This list is always a superset of permanentlyExcludedWorkers.
	// Map from microtaskID to a set of workerIDs.
	// < microtaskKey, < worker1Id, worker2Id, ... > >
	@Serialize private Map< String, HashSet<String>> excludedWorkers = new HashMap< String, HashSet<String> >();

	// Workers that are permanently excluded from doing a microtask. In constrast to excludedWorkers, this set only
	// grows over time. Map from microtaskKey to a set of workerIDs
	// < microtaskKey, < worker1Id, worker2Id, ... > >
	@Serialize private Map< String, HashSet<String> > permanentlyExcludedWorkers = new HashMap< String, HashSet<String> >();


	//////////////////////////////////////////////////////////////////////////////
	//  Project Management
	//////////////////////////////////////////////////////////////////////////////

	public Key<Project> getKey(){ return Key.create(Project.class, id); }

	public String getID(){ return id; }

	// Default constructor for deserialization only
	private Project(){}

	// Constructor for initial creation (flag is ignored)
	// this is called ONCE per project by Construct
	private Project(String id)
	{
		// set the id
		this.id = id;

		// save the project
		ofy().save().entity(this).now();

		// create log entry for the project created
		HistoryLog.Init(this.getID()).addEvent(new ProjectCreated(this));

		// Load functions from Firebase and
		// for each function queue a function create command
		String functions = FirebaseService.readClientRequest(this.getID());
		ClientRequestDTO dto;
		try {

			dto = (ClientRequestDTO) DTO.read(functions, ClientRequestDTO.class);


			ADTCommand.create(
					"A Boolean represents one of two values: true or false.",
					"Boolean",
					new HashMap<String, String>(),
					new HashMap<String, String>(),
					true,
					true
			);

			ADTCommand.create(
					"Number is the only type of number. Numbers can be written with, or without, decimals.",
					"Number",
					new HashMap<String, String>(),
					new HashMap<String, String>(),
					true,
					true
			);

			ADTCommand.create(
					"A String simply stores a series of characters like \"John Doe\". A string can be any text inside double quotes.",
					"String",
					new HashMap<String, String>(),
					new HashMap<String, String>(),
					true,
					true
			);

			for(ADTDTO ADT : dto.ADTs){
				ADTCommand.create(ADT.description, ADT.name, ADT.getStructure(), ADT.getExamples(), true, ADT.isReadOnly);
			}


			for (FunctionDTO functionDTO : dto.functions)
			{
				FunctionCommand.addClientRequestsArtifacts(functionDTO);
			}
			// save project settings into firebase

			FirebaseService.writeSetting("reviews", this.reviewsEnabled.toString() , this.getID());
			FirebaseService.writeSetting("tutorials", this.tutorialsEnabled.toString() , this.getID());

			// save again the entity with the created functions
			ofy().save().entity(this).now();

		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}


	}


	// Creates a new project instance. This can only be called for a project that does not yet exist
	// (or that has been reset using Clear).
	public static Project Construct(String id)
	{
		return new Project(id);
	}


	// Loads a project instance from the datastore.
	// this is called every time a project is instantiated
	public static Project Create(String id)
	{
		// Need to use an ancestor query to do this inside a transaction.
		// But the ancestor of project is project.
		// So we just create a normal key with only the type and id
		project = ofy().load().key(Key.create(Project.class, id)).now();

		return project;
	}

	// Clears the project, returning it to the initial state
	public static void Clear(String projectID)
	{
		// Clear data for the project in firebase
		FirebaseService.clear(projectID);

		// retrieve the project key
		Key<Project> projectKey = Key.create(Project.class, projectID);

		// DELETE THE WORKERS
		// by an anchestor query
		Iterable<Key<Worker>>    workers    = ofy().transactionless().load().type(Worker.class).ancestor(projectKey).keys();
		ofy().transactionless().delete().keys(workers);

		// DELETE THE ARTIFACTS
		// filtering per projectId
		Iterable<Key<Artifact>>  artifacts  = ofy().transactionless().load().type(Artifact.class).filter("projectId",projectID).keys();
		ofy().transactionless().delete().keys(artifacts);

		// DELETE THE MICROTASKS
		// filtering per projectId
		Iterable<Key<Microtask>>  microtasks  = ofy().transactionless().load().type(Microtask.class).filter("projectId",projectID).keys();
		ofy().transactionless().delete().keys(microtasks);

		// finally delete the project
		ofy().transactionless().delete().key(projectKey);
	}

	//////////////////////////////////////////////////////////////////////////////
	//  Microtask Queue Management
	//////////////////////////////////////////////////////////////////////////////

	// Queues the microtask onto the project's global queue
	// Provides an optional parameter (which may be left null) for an excludedWorker,
	// who, if provided, will be permanently excluded from doing the microtask.
	public void queueMicrotask( Key<Microtask> microtaskKey, String excludedWorkerID)
	{
		// if the microtask is not in the queue, add it
		if( ! microtaskQueue.contains( Microtask.keyToString(microtaskKey) )  ){
			microtaskQueue.addLast( Microtask.keyToString(microtaskKey) ) ;
			HistoryLog
				.Init(this.getID())
				.addEvent( new MicrotaskQueued(  ofy().load().key(microtaskKey).now() ));
		}

		// if is there an excluded workerId,
		// add the workerId to the excluded workers for this microtask
		if ( excludedWorkerID != null ){
			addPermExcludedWorkerForMicrotask( microtaskKey, excludedWorkerID );
		}

		// save the queue in Objectify and Firebase
		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskQueue(new QueueInFirebase(microtaskQueue), this.getID());
	}

	// Queues the microtask onto the project's review microtask queue
	public void queueReviewMicrotask(Key<Microtask> microtaskKey, String excludedWorkerID)
	{
		// add the review microtask to the reviews queue
		if( ! reviewQueue.contains( Microtask.keyToString(microtaskKey) )  ){
			reviewQueue.addLast( Microtask.keyToString(microtaskKey) ) ;
			HistoryLog
			.Init(this.getID())
			.addEvent( new MicrotaskQueued(  ofy().load().key(microtaskKey).now() ));
		}

		// exclude the worker who submitted the microtask that spawned the review
		// from the workers that can reach this review
		if(excludedWorkerID!=null){
			addPermExcludedWorkerForMicrotask(microtaskKey, excludedWorkerID);
		}
		// save the review queue in Objectify and Firebase
		ofy().save().entity(this).now();
		FirebaseService.writeReviewQueue(new QueueInFirebase(reviewQueue), this.getID());
	}
	// Queues the microtask onto the project's microtask queue with 2 excluded workerID, the challenger and the challengee workers
	public void queueChellengeReviewMicrotask( Key<Microtask> microtaskKey, String firstExcludedWorkerID, String secondExcludedWorkerID)
	{
		// if the microtask is not in the queue, add it
		if( ! microtaskQueue.contains( Microtask.keyToString(microtaskKey) )  ){
			microtaskQueue.addLast( Microtask.keyToString(microtaskKey) ) ;
			HistoryLog
				.Init(this.getID())
				.addEvent( new MicrotaskQueued(  ofy().load().key(microtaskKey).now() ));
		}

		// add the workerId to the excluded workers for this microtask
		addPermExcludedWorkerForMicrotask( microtaskKey, firstExcludedWorkerID );
		addPermExcludedWorkerForMicrotask( microtaskKey, secondExcludedWorkerID );


		// save the queue in Objectify and Firebase
		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskQueue(new QueueInFirebase(microtaskQueue), this.getID());
	}

	// adds a workerId to the permanent excluded workers for the microtask with microtaskKey
	private void addPermExcludedWorkerForMicrotask( Key<Microtask> microtaskKey, String excludedWorkerID)
	{
		// retrieve the current permanently excluded workers for the microtask
		HashSet<String> permExcludedForMicrotask = permanentlyExcludedWorkers.get( Microtask.keyToString(microtaskKey) );

		// if there aren't permanently excluded workers
		if (permExcludedForMicrotask == null){

			// create a new hash set
			permExcludedForMicrotask = new HashSet<String>();
			permanentlyExcludedWorkers.put(  Microtask.keyToString(microtaskKey) , permExcludedForMicrotask );
		}

		// add the worker to the permanently excluded workers for this microtask
		permExcludedForMicrotask.add(excludedWorkerID);

		// add the worker to the actual excluded
		addExcludedWorkerForMicrotask( microtaskKey , excludedWorkerID );
	}

	// adds a workerId to the excluded workers for the microtask with microtaskKey
	private void addExcludedWorkerForMicrotask(Key<Microtask> microtaskKey, String workerID)
	{
		// retrieve the current permanently excluded workers for the microtask
		// if is empty create one
		String microtaskKeyString =  Microtask.keyToString(microtaskKey);
		HashSet<String> excludedWorkersForMicrotask = excludedWorkers.get( microtaskKeyString );
		if (excludedWorkersForMicrotask == null)
		{
			excludedWorkersForMicrotask = new HashSet<String>();
			excludedWorkers.put( microtaskKeyString , excludedWorkersForMicrotask);
		}
		
		excludedWorkersForMicrotask.add(workerID);
		
		//add/update excluded list inside firebase	
		String workerList = excludedWorkersToString(excludedWorkersForMicrotask);
		FirebaseService.writeMicrotaskExcludedWorkers(microtaskKeyString,
			this.getID(), workerList);
	}
	
	//transforms excluded workers IDs into one string, to save in firebase
	private final String excludedWorkersToString(HashSet<String> WorkersList){
		String Ids = "";
		for(String id : WorkersList){
			Ids += id +",";
		}
		return Ids;
	}
	// Gets the currently assigned microtask for the specified worker or returns null if the worker
	// does not have a currently assigned microtask. Returns the microtaskID of the microtask.
	public Key<Microtask> lookupMicrotaskAssignment(String workerID)
	{
		String microtaskKeyString =  microtaskAssignments.get( workerID );
		if( microtaskKeyString == null )
			return null;

		return Microtask.stringToKey(microtaskKeyString);
	}

	public void unassignMicrotask( final String workerID ){
		String assignedMicrotaskKey = microtaskAssignments.get(workerID);
		if( assignedMicrotaskKey != null ){

			microtaskAssignments.put( workerID, null);

			Microtask assignedMtask = ofy().load().key( Microtask.stringToKey(assignedMicrotaskKey) ).now();
			HistoryLog
				.Init(this.getID())
				.addEvent(new MicrotaskUnassigned( assignedMtask, workerID));
			
			FirebaseService.writeMicrotaskAssigned( assignedMicrotaskKey , workerID, project.getID(), false);

		}
		
	}

	// Assigns a microtask to worker and returns its microtaskKey.
	// Returns null if no microtasks are available.
	public Key<Microtask> assignMicrotask( final String workerID)
	{
		// Ensure that the worker is marked as logged in
		loggedInWorkers.add( workerID );

		// Look for a microtask, checking constraints on it along the way
		String  microtaskKey = null;
		Boolean isReview = false;
		// First, check if there any review microtasks queued.
		// Review microtasks get priority, as they need to be done quickly.
		for ( String potentialMicrotaskKey : reviewQueue ){
			if ( microtaskKey == null && assignmentIsValid( potentialMicrotaskKey, workerID ) ){
				microtaskKey = potentialMicrotaskKey;
				isReview = true;
			}
		}

		if( microtaskKey == null ){
			for ( String potentialMicrotaskKey : microtaskQueue ){
				if ( microtaskKey == null && assignmentIsValid( potentialMicrotaskKey, workerID) ){
					microtaskKey = potentialMicrotaskKey;
				}
			}
		}
		Microtask microtask=null;
		// If there are no more microtasks currently available, return null
		if ( microtaskKey != null) {
			Microtask mtask = ofy().load().key( Microtask.stringToKey(microtaskKey) ).now();
			if( mtask!=null ){

				if( isReview ){
					reviewQueue.remove( microtaskKey );
					FirebaseService.writeReviewQueue(new QueueInFirebase(reviewQueue), project.getID() );
				} else {
					microtaskQueue.remove( microtaskKey );
					FirebaseService.writeMicrotaskQueue(new QueueInFirebase(microtaskQueue), project.getID() );
				}
				// assign it to the worker
				mtask.setWorkerId( workerID );
				microtaskAssignments.put( workerID,  Microtask.keyToString( mtask.getKey() ) );

				//ofy().save().entity(mtask).now();
				System.out.println("assigning "+ mtask.getKey() +" to worker "+workerID);
				microtask=mtask;
			}
			else{
				System.out.println("((((((((((((erroooor mtask null");
			}
		}



		if( microtask != null ){

			FirebaseService.writeMicrotaskAssigned( Microtask.keyToString( microtask.getKey() ), workerID, project.getID(), true);

			HistoryLog
				.Init(project.getID())
				.addEvent( new MicrotaskDequeued(microtask));

			HistoryLog
				.Init(project.getID())
				.addEvent(new MicrotaskAssigned(microtask,workerID,"assigned"));

			// return the assigned microtask key
			return microtask.getKey();
		}

		return null;
	}

	public Key<Microtask> assignSpecificMicrotask( final String workerID, final String currentKey)
	{
		// Ensure that the worker is marked as logged in
		loggedInWorkers.add( workerID );

		// Look for a microtask, checking constraints on it along the way
		String  microtaskKey = currentKey;
		Boolean isReview = false, canAssign = false;
		
		//Checks if microtask is in Review or Microtask Queue
		if(reviewQueue.contains(microtaskKey)){
			isReview = true;
			canAssign = true;
		}
		else if(microtaskQueue.contains(microtaskKey)){
			canAssign = true;			
		}
		
		Microtask microtask=null;
		// If there are no more microtasks currently available, return null
		//&& assignmentIsValid( microtaskKey, workerID)
		if ( microtaskKey != null  && canAssign ) {
			Microtask mtask = ofy().load().key( Microtask.stringToKey(microtaskKey) ).now();
			if( mtask!=null ){

				if( isReview ){
					reviewQueue.remove( microtaskKey );
					FirebaseService.writeReviewQueue(new QueueInFirebase(reviewQueue), project.getID() );
				} else {
					microtaskQueue.remove( microtaskKey );
					FirebaseService.writeMicrotaskQueue(new QueueInFirebase(microtaskQueue), project.getID() );
				}
				// assign it to the worker
				mtask.setWorkerId( workerID );
				microtaskAssignments.put( workerID,  Microtask.keyToString( mtask.getKey() ) );

				//ofy().save().entity(mtask).now();
				microtask=mtask;
			}
			else{
				System.out.println("((((((((((((erroooor mtask null");
			}
		}



		if( microtask != null ){

			FirebaseService.writeMicrotaskAssigned( Microtask.keyToString( microtask.getKey() ), workerID, project.getID(), true);

			HistoryLog
				.Init(project.getID())
				.addEvent( new MicrotaskDequeued(microtask));

			HistoryLog
				.Init(project.getID())
				.addEvent(new MicrotaskAssigned(microtask,workerID,"picked"));

			// return the assigned microtask key
			return microtask.getKey();
		}

		return null;
	}
	
	
	// Checks both the excludedWorkers and skippedWorkers to see if microtaskKey is a valid
	// microtask assignment for workerID. Returns true iff this is the case.
	private boolean assignmentIsValid( String potentialMicrotaskKey, String workerID)
	{
		// retrieve the excluded workers
		HashSet<String> excludedWorkersForMicrotask = excludedWorkers.get( potentialMicrotaskKey );

		// if the excluded workers is empty and
		// contains the workerId
		if ( excludedWorkersForMicrotask != null && excludedWorkersForMicrotask.contains(workerID))
			return false;
		else
			return true;
	}

	// Called to process a microtask submission based on form data (in json format)
	// If the microtask has previously been submitted or is no longer open, the submission is
	// dropped, ensuring workers cannot submit against already completed microtasks.
	public void submitMicrotask(Key<Microtask> microtaskKey, String jsonDTOData, String workerID, Project project){
		WorkerCommand.increaseStat(workerID, "submits",1);
		Microtask microtask = ofy().load().key( microtaskKey ).now();
		if(microtask!=null){			
			// submit only if the request come from
			// the current assigned worker of the microtask
			if(microtask.isAssignedTo(workerID) ){		
				//boolean to signal if review microtask was created -> microtask is waiting review
				boolean waitReview = true;
				
				// If reviewing is enabled and the microtask
				// is not in [Review, ReuseSearch,DebugTestFailure],
				// spawn a new review microtask
				if (reviewsEnabled && !( microtask.getClass().equals(Review.class) || microtask.getClass().equals(ChallengeReview.class)) ){
					MicrotaskCommand.createReview(microtaskKey, workerID, jsonDTOData, workerID);

				}
				// else submit the microtask
				else {
					MicrotaskCommand.submit(microtaskKey, jsonDTOData, workerID, microtask.getSubmitValue());
					waitReview = false;
				}


				// write the history log entry about the microtask submission
				HistoryLog.Init(this.getID()).addEvent(new MicrotaskSubmitted(microtask, workerID));
				FirebaseService.writeMicrotaskSubmission(jsonDTOData, Microtask.keyToString(microtaskKey), this.id);
			}
		}
		else
		{
			Logger.getLogger("LOGGER").severe("LOAD FAILED: MICROTASK "+microtaskKey);
		}


	}

	// Unassigns worker from this microtask
	// Precondition - the worker must be assigned to this microtask
	public void skipMicrotask(Key<Microtask> microtaskKey, String workerID, Boolean disablePoint)
	{
		WorkerCommand.increaseStat(workerID, "skips",1);
		Microtask microtask = ofy().load().key(microtaskKey).now();
		if( microtask!=null && microtask.isAssignedTo(workerID)){

			microtask.setWorkerId(null);
			addExcludedWorkerForMicrotask( microtaskKey, workerID);


			// Add the work back to the appropriate queue
			if(microtask.microtaskName() != "Review")
				queueMicrotask( microtaskKey, null);
			else
				queueReviewMicrotask(microtaskKey, workerID);

			resetIfAllSkipped( microtaskKey );
			ofy().save().entity(this).now();


			MicrotaskCommand.skip( microtaskKey, workerID, disablePoint);
			FirebaseService.writeMicrotaskAssigned( Microtask.keyToString(microtaskKey) , workerID, project.getID(), false);	
		}

	}


	// Checks the microtask to see if all workers have skipped it.
	// If so, resets the excluded workers to give workers another chance.
	private void resetIfAllSkipped( Key<Microtask> microtaskKey )
	{
		String microtaskKeyStringified = Microtask.keyToString(microtaskKey);
		// retrieve the excluded workers for the microtask
		HashSet<String> excludedWorkersForMicrotask = excludedWorkers.get(microtaskKeyStringified);

		// if all the logged in workers are excluded
		if (excludedWorkersForMicrotask!=null && excludedWorkersForMicrotask.containsAll(loggedInWorkers))
		{
			// Add back the permanently excluded workers
			HashSet<String> permanentlyExcludedWorkersForMicrotask = permanentlyExcludedWorkers.get( microtaskKeyStringified );
			
			//clean excluded list inside firebase	
			FirebaseService.writeMicrotaskExcludedWorkers(microtaskKeyStringified,
				this.getID(), "");
			
			excludedWorkers.remove(microtaskKeyStringified);

			if (permanentlyExcludedWorkersForMicrotask != null){
				excludedWorkers.put(microtaskKeyStringified, permanentlyExcludedWorkersForMicrotask);
				String workerList = excludedWorkersToString(permanentlyExcludedWorkersForMicrotask);
				FirebaseService.writeMicrotaskExcludedWorkers(microtaskKeyStringified,
					this.getID(), workerList);
			}
			ofy().save().entity(this).now();
		}

	}


	//////////////////////////////////////////////////////////////////////////////
	//  Workers Management
	//////////////////////////////////////////////////////////////////////////////

	public void logoutInactiveWorkers(){
		for ( String workerId : loggedInWorkers){
			if( ! FirebaseService.isWorkerLoggedIn( workerId, this.getID()) ){
				this.logoutWorker( workerId );
			}
		}
	}

	// Logs out the specified worker, clearing all of their current assigned work
	public void logoutWorker(String workerID)
	{
		// retrieve the assigned microtask for the workerId
		String microtaskKeyString        = microtaskAssignments.get(workerID);
		if(microtaskKeyString!=null)
		{
			Key<Microtask> currentAssignment = Microtask.stringToKey(microtaskKeyString);

			// TODO: if the current assignment is a review, this should go in the review queue!
			// if a current assignment exists requeue it
			if (currentAssignment != null){
				Microtask microtask= ofy().load().key(currentAssignment).now();
				if(microtask.microtaskName()!="Review")
					queueMicrotask( currentAssignment, null);
				else
					queueReviewMicrotask( currentAssignment, null);
			}

			// set null to the assignments of the workerID
			microtaskAssignments.put( workerID, null);
			// save the queue and the assignments
			ofy().save().entity(this).now();
				
			FirebaseService.writeMicrotaskQueue(new QueueInFirebase(microtaskQueue), this.getID());
			FirebaseService.writeMicrotaskAssigned( Microtask.keyToString(currentAssignment) , workerID, project.getID(), false);
		}
		// write to firebase that the worker logged out
		FirebaseService.writeWorkerLoggedOut( workerID, this.getID());
	}


	//////////////////////////////////////////////////////////////////////////////
	//  Test Management
	//////////////////////////////////////////////////////////////////////////////

//	// Requests that the tests be run for the project
//	public void requestTestRun()
//	{
//		// Schedule a MachineUnitTest to be run, if one is not already scheduled
//		if (!waitingForTestRun)
//		{
//			waitingForTestRun = true;
//			ofy().save().entity(this).now();
//			//Microtask microtask = new MachineUnitTest(this);
//			//ProjectCommand.queueMicrotask(microtask.getID(), null);
//		}
//	}
//
//	// Notifies the project that tests are currently out and about to run
//	public void testsAboutToRun()
//	{
//		// Reset the waitingForTestRun, as the current tests to be run are now frozen and any
//		// subsequent changes to the tests or functions will not be reflected in the current test
//		// run.
//		waitingForTestRun = false;
//		ofy().save().entity(this).now();
//	}



	//////////////////////////////////////////////////////////////////////////////
	//  Other Stuff
	//////////////////////////////////////////////////////////////////////////////

	public void enableReviews(Boolean reviewsEnabled)
	{
		this.reviewsEnabled = reviewsEnabled;
		FirebaseService.writeSetting("reviews", reviewsEnabled.toString() , this.getID());
		ofy().save().entity(this).now();
	}


	public HashSet<String> getLoggedInWorkers() {
		return loggedInWorkers;
	}


	public void enableTutorials(Boolean tutorialsEnabled) {
		// TODO Auto-generated method stub
		this.tutorialsEnabled = tutorialsEnabled;
		FirebaseService.writeSetting("tutorials", tutorialsEnabled.toString() , project.getID());
		ofy().save().entity(this).now();
	}

}
