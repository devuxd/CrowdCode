package com.crowdcoding.entities;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Map;

import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.commands.MicrotaskCommand;
import com.crowdcoding.commands.ProjectCommand;
import com.crowdcoding.commands.TestCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.FunctionDescriptionDTO;
import com.crowdcoding.dto.FunctionDescriptionsDTO;
import com.crowdcoding.dto.TestDescriptionDTO;
import com.crowdcoding.dto.firebase.QueueInFirebase;
import com.crowdcoding.entities.microtasks.DebugTestFailure;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.entities.microtasks.ReuseSearch;
import com.crowdcoding.entities.microtasks.Review;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.history.MicrotaskAssigned;
import com.crowdcoding.history.MicrotaskSpawned;
import com.crowdcoding.history.MicrotaskSubmitted;
import com.crowdcoding.history.ProjectCreated;
import com.crowdcoding.util.FirebaseService;
import com.crowdcoding.util.IDGenerator;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Ignore;
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

	private IDGenerator idgenerator;

	@Id private String id;
	@Ignore private HistoryLog historyLog;

	private Boolean reviewsEnabled = true;			// Disabling this flag stops new review microtasks from being generated
	private Boolean tutorialsEnabled = true;
	private boolean waitingForTestRun = false;								// is the project currently waiting for tests to be run?

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
	//  Microtask Key Management
	//////////////////////////////////////////////////////////////////////////////

	// from a objectify Microtask Key to a string "artifactId-microtaskId"
	public static String MicrotaskKeyToString( Key<Microtask> key ){
		String keyString = null;
		if( key != null )
			keyString = key.getParent().getId()+"-"+key.getId();

		return keyString;
	}

	// opposite as MicrotaskKeyToString
	public static Key<Microtask> StringToMicrotaskKey( String keyString ){
		Key<Microtask> keyObj = null;

		if( !( keyString == null || keyString.length() == 0) ){
			String[] ids = keyString.split("-");
			Key<Artifact> parentKey = Key.create(Artifact.class, Integer.parseInt(ids[0]) );
			keyObj = Key.create(parentKey,Microtask.class, Integer.parseInt(ids[1]));
		}
		return keyObj;
	}

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

		// instantiate the history log
		this.historyLog = new HistoryLog();

		// instantiate the id generator
		idgenerator = new IDGenerator(false);

		// save the project
		ofy().save().entity(this).now();

		// create log entry for the project created
		this.historyLog.beginEvent(new ProjectCreated(this));
		this.historyLog.endEvent();

		// Load ADTs from Firebase
		FirebaseService.copyADTs(this);

		// Load functions from Firebase and
		// for each function queue a function create command
		String functions = FirebaseService.readClientRequestFunctions(this);
		FunctionDescriptionsDTO functionsDTO;
		try {
			functionsDTO = (FunctionDescriptionsDTO) DTO.read(functions, FunctionDescriptionsDTO.class);
		
			for (FunctionDescriptionDTO functionDTO : functionsDTO.functions)
			{
				FunctionCommand.create(functionDTO.name, functionDTO.returnType, functionDTO.paramNames,
						functionDTO.paramTypes,functionDTO.paramDescriptions, functionDTO.header, functionDTO.description, functionDTO.code, functionDTO.tests, functionDTO.readOnly);

			}
				
			// save project settings into firebase
			System.out.println("WRITING SETTINGS");
			FirebaseService.writeSetting("reviews", this.reviewsEnabled.toString() , this);
			FirebaseService.writeSetting("tutorials", this.tutorialsEnabled.toString() , this);

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
		project = ofy().load().key(Key.create(Project.class, id)).get();

		// When a project is intialized (above), the history log is created inside the project constructor.
		// It has to be created there because it must be created before the project can be initialized.
		// When the project is loaded from the datastore, we create a fresh history log here.
		project.historyLog = new HistoryLog();

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
		// workers are parented under project
		// so ancestor query is ok
		Iterable<Key<Worker>>    workers    = ofy().transactionless().load().type(Worker.class).ancestor(projectKey).keys();
		ofy().transactionless().delete().keys(workers);

		// DELETE THE MICROTASKS
		// microtasks are parented under artifacts
		// ??? is good the ancestor query ???
		Iterable<Key<Microtask>> microtasks = ofy().transactionless().load().type(Microtask.class).ancestor(projectKey).keys();
		ofy().transactionless().delete().keys(microtasks);

		// DELETE THE ARTIFACTS
		// artifacts are parented under project
		// so ancestor query is ok
		Iterable<Key<Artifact>>  artifacts  = ofy().transactionless().load().type(Artifact.class).ancestor(projectKey).keys();
		ofy().transactionless().delete().keys(artifacts);

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
		System.out.println("--> PROJECT: ADDING TO QUEUE mtask "+Project.MicrotaskKeyToString(microtaskKey)+" ");

		// if the microtask is not in the queue, add it
		if( ! microtaskQueue.contains( Project.MicrotaskKeyToString(microtaskKey) ) ){
			microtaskQueue.addLast( Project.MicrotaskKeyToString(microtaskKey) );
		}

		// if is there an excluded workerId,
		// add the workerId to the excluded workers for this microtask
		if ( excludedWorkerID != null ){
			addPermExcludedWorkerForMicrotask( microtaskKey, excludedWorkerID );
		}

		// save the queue in Objectify and Firebase
		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskQueue(new QueueInFirebase(microtaskQueue), project);
	}

	// Queues the microtask onto the project's review microtask queue
	public void queueReviewMicrotask(Key<Microtask> microtaskKey, String excludedWorkerID)
	{
		// add the review microtask to the reviews queue
		reviewQueue.addLast(  Project.MicrotaskKeyToString(microtaskKey) );

		// exclude the worker who submitted the microtask that spawned the review
		// from the workers that can reach this review
		addPermExcludedWorkerForMicrotask(microtaskKey, excludedWorkerID);

		// save the review queue in Objectify and Firebase
		ofy().save().entity(this).now();
		FirebaseService.writeReviewQueue(new QueueInFirebase(reviewQueue), project);
	}

	// adds a workerId to the permanent excluded workers for the microtask with microtaskKey
	private void addPermExcludedWorkerForMicrotask( Key<Microtask> microtaskKey, String excludedWorkerID)
	{
		// retrieve the current permanently excluded workers for the microtask
		HashSet<String> permExcludedForMicrotask = permanentlyExcludedWorkers.get( Project.MicrotaskKeyToString( microtaskKey ) );

		// if there aren't permanently excluded workers
		if (permExcludedForMicrotask == null){

			// create a new hash set
			permExcludedForMicrotask = new HashSet<String>();
			permanentlyExcludedWorkers.put(  Project.MicrotaskKeyToString(microtaskKey) , permExcludedForMicrotask );
		}

		// add the worker to the permanently excluded workers for this microtask
		permExcludedForMicrotask.add(excludedWorkerID);

		// add the worker to the actual excluded
		addExcludedWorkerForMicrotask( microtaskKey, excludedWorkerID );
	}

	// adds a workerId to the excluded workers for the microtask with microtaskKey
	private void addExcludedWorkerForMicrotask(Key<Microtask> microtaskKey, String workerID)
	{
		// retrieve the current permanently excluded workers for the microtask
		// if is empty create one
		HashSet<String> excludedWorkersForMicrotask = excludedWorkers.get( Project.MicrotaskKeyToString( microtaskKey ) );
		if (excludedWorkersForMicrotask == null)
		{
			excludedWorkersForMicrotask = new HashSet<String>();
			excludedWorkers.put(  Project.MicrotaskKeyToString(microtaskKey) , excludedWorkersForMicrotask);
		}

		excludedWorkersForMicrotask.add(workerID);
	}

	// Gets the currently assigned microtask for the specified worker or returns null if the worker
	// does not have a currently assigned microtask. Returns the microtaskID of the microtask.
	public Key<Microtask> lookupMicrotaskAssignment(String workerID)
	{
		String microtaskKeyString =  microtaskAssignments.get( workerID );

		// if no microtask assignments for this worker, return null
		if( microtaskKeyString == null ) return null;

		return Project.StringToMicrotaskKey(microtaskKeyString);
	}

	// Assigns a microtask to worker and returns its microtaskKey.
	// Returns null if no microtasks are available.
	public Key<Microtask> assignMicrotask( String workerID, String workerHandle )
	{
		// Ensure that the worker is marked as logged in
		loggedInWorkers.add( workerID );

		// Look for a microtask, checking constraints on it along the way
		Key<Microtask> microtaskKey = null;

		// First, check if there any review microtasks queued.
		// Review microtasks get priority, as they need to be done quickly.
		for ( String potentialMicrotaskKey : reviewQueue ){
			if ( microtaskKey == null && assignmentIsValid( potentialMicrotaskKey, workerID ) ){
				microtaskKey = Project.StringToMicrotaskKey( potentialMicrotaskKey );
			}
		}

		// if there an available review has been found remove it from the queue
		// and update the Firebase review queue
		if ( microtaskKey != null ) {
			reviewQueue.remove( Project.MicrotaskKeyToString( microtaskKey ) );
			FirebaseService.writeReviewQueue(new QueueInFirebase(reviewQueue), project);
		}

		// else continue looking in the global microtask queue
		else {
			for ( String potentialMicrotaskKey : microtaskQueue ){
				if ( microtaskKey == null && assignmentIsValid( potentialMicrotaskKey, workerID) ){
					microtaskKey =  Project.StringToMicrotaskKey(potentialMicrotaskKey) ;
				}
			}

			// if a microtask has been found remove it from the queue
			// and update the Firebase microtask queue
			if ( microtaskKey != null ){
				microtaskQueue.remove( Project.MicrotaskKeyToString( microtaskKey ) );
				FirebaseService.writeMicrotaskQueue(new QueueInFirebase(microtaskQueue), project);
			}
		}

		// TODO: we need to check if the microtask is no longer needed

		// 2. If the microtask is no longer needed, keep looking
		/*if (!potentialMicrotask.isStillNeeded(project))
		{
			potentialMicrotask.markCompleted(project);
			continue microtaskSearch;
		}*/

		// If there are no more microtasks currently available, return null
		if ( microtaskKey == null) {
			ofy().save().entity(this).now();
			return null;
		}

		// else if a microtask was found
		else{
			// assign it to the worker
			microtaskAssignments.put( workerID,  Project.MicrotaskKeyToString(microtaskKey) );
			FirebaseService.writeMicrotaskAssigned( Project.MicrotaskKeyToString(microtaskKey), workerID, workerHandle, this, true);

			// write the history log entry about the microtask assignment
			Microtask mtask = ofy().load().key(microtaskKey).get();
			project.historyLog().beginEvent(new MicrotaskAssigned(mtask,workerID));
			project.historyLog().endEvent();

			// save the project
			ofy().save().entity(this).now();

			// return the assigned microtask key
			return microtaskKey;
		}

		// TODO: we should store this to firebase somewhere.
		//microtask.assignmentTimeInMillis = System.currentTimeMillis();
	}

	// Checks both the excludedWorkers and skippedWorkers to see if microtaskKey is a valid
	// microtask assignment for workerID. Returns true iff this is the case.
	private boolean assignmentIsValid( String potentialMicrotaskKey, String workerID)
	{
		// retrieve the excluded workers
		HashSet<String> microtaskExcludedWorkers = excludedWorkers.get( potentialMicrotaskKey );

		// if the excluded workers is empty and
		// contains the workerId
		if (microtaskExcludedWorkers != null && microtaskExcludedWorkers.contains(workerID))
			return false;
		else
			return true;
	}

	// Called to process a microtask submission based on form data (in json format)
	// If the microtask has previously been submitted or is no longer open, the submission is
	// dropped, ensuring workers cannot submit against already completed microtasks.
	public void submitMicrotask(Key<Microtask> microtaskKey, Class microtaskType, String jsonDTOData, String workerID, Project project){
		
		// submit only if the request come from
		// the current worker of the microtask
		String assignedMicrotask =  microtaskAssignments.get( workerID );
		if( assignedMicrotask.equals( Project.MicrotaskKeyToString(microtaskKey) )){
			
			// Unassign the microtask from the worker
			microtaskAssignments.put( workerID, null );

			// save the project
			ofy().save().entity(this).now();

			// write the history log entry about the microtask submission
			Microtask microtask = ofy().load().key( microtaskKey ).get();
			project.historyLog().beginEvent(new MicrotaskSubmitted(microtask, workerID));
			project.historyLog().endEvent();

			// If reviewing is enabled and the microtask
			// is not in [Review, ReuseSearch,DebugTestFailure],
			// spawn a new review microtask
			if (reviewsEnabled && !( microtaskType.equals(Review.class) || microtaskType.equals(ReuseSearch.class) || microtaskType.equals(DebugTestFailure.class) ) ){
				MicrotaskCommand.createReview(microtaskKey, workerID, jsonDTOData, workerID);
			}

			// else submit the microtask
			else {
				MicrotaskCommand.submit(microtaskKey, jsonDTOData, workerID, microtask.getSubmitValue());
			}
			
		}
	}

	// Unassigns worker from this microtask
	// Precondition - the worker must be assigned to this microtask
	public void skipMicrotask(Key<Microtask> microtaskKey, String workerID, Project project)
	{
		// Unassign the microtask from the worker and exclude the worker
		microtaskAssignments.put( workerID, null);
		addExcludedWorkerForMicrotask( microtaskKey, workerID);

		// Add the work back to the appropriate queue
		Microtask microtask= ofy().load().key(microtaskKey).get();
		if(microtask.microtaskName()!="Review")
			queueMicrotask( microtaskKey, workerID);
		else
			queueReviewMicrotask(microtaskKey, workerID);

		resetIfAllSkipped( microtaskKey );

		ofy().save().entity(this).now();
		MicrotaskCommand.skip( microtaskKey, workerID);
	}


	// Checks the microtask to see if all workers have skipped it.
	// If so, resets the excluded workers to give workers another chance.
	private void resetIfAllSkipped( Key<Microtask> microtaskKey )
	{
		// retrieve the excluded workers for the microtask
		HashSet<String> excludedWorkersForMicrotask = excludedWorkers.get( Project.MicrotaskKeyToString(microtaskKey) );

		// if all the logged in workers are excluded
		if (excludedWorkersForMicrotask.containsAll(loggedInWorkers))
		{
			// clear the excluded
			excludedWorkersForMicrotask.clear();

			// Add back the permanently excluded workers
			HashSet<String> permanentlyExcludedWorkersForMicrotask = permanentlyExcludedWorkers.get( Project.MicrotaskKeyToString(microtaskKey) );
			if (permanentlyExcludedWorkersForMicrotask != null)
				excludedWorkersForMicrotask.addAll(permanentlyExcludedWorkersForMicrotask);


			ofy().save().entity(this).now();
		}
	}


	//////////////////////////////////////////////////////////////////////////////
	//  Workers Management
	//////////////////////////////////////////////////////////////////////////////

	public void logoutInactiveWorkers(){
		for ( String workerId : loggedInWorkers){
			if( ! FirebaseService.isWorkerLoggedIn( workerId, this) ){
				this.logoutWorker( workerId );
			}
		}
	}

	// Logs out the specified worker, clearing all of their current assigned work
	public void logoutWorker(String workerID)
	{
		System.out.println("--> PROJECT: logging out "+workerID);

		// retrieve the assigned microtask for the workerId
		String microtaskKeyString        = microtaskAssignments.get(workerID);
		Key<Microtask> currentAssignment = Project.StringToMicrotaskKey(microtaskKeyString);

		// TODO: if the current assignment is a review, this should go in the review queue!
		// if a current assignment exists requeue it
		if (currentAssignment != null){
			Microtask microtask= ofy().load().key(currentAssignment).get();
			if(microtask.microtaskName()!="Review")
				queueMicrotask( currentAssignment, workerID);
			else
				queueReviewMicrotask(currentAssignment, workerID);
		}
		// set null to the assignments of the workerID
		microtaskAssignments.put( workerID, null);

		// save the queue and the assignments
		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskQueue(new QueueInFirebase(microtaskQueue), project);

		// write to firebase that the worker logged out
		FirebaseService.writeWorkerLoggedOut( workerID, this);
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
	//  History Log Management
	//////////////////////////////////////////////////////////////////////////////

	// getter for the historyLog
	public HistoryLog historyLog(){ return historyLog; }

	// Publishes the history log to Firebase
	public void publishHistoryLog()
	{
		FirebaseService.publishHistoryLog(historyLog.json(), this);
	}



	//////////////////////////////////////////////////////////////////////////////
	//  Other Stuff
	//////////////////////////////////////////////////////////////////////////////

	public void enableReviews(Boolean reviewsEnabled)
	{
		this.reviewsEnabled = reviewsEnabled;
		FirebaseService.writeSetting("reviews", reviewsEnabled.toString() , project);
		ofy().save().entity(this).now();
	}

	public long generateID(String tag)
	{
		long id = idgenerator.generateID(tag);

		// State of embedded object (id generator) changed, so state must be saved.
		ofy().save().entity(this).now();

		return id;
	}

	public void enableTutorials(Boolean tutorialsEnabled) {
		// TODO Auto-generated method stub
		this.tutorialsEnabled = tutorialsEnabled;
		FirebaseService.writeSetting("tutorials", tutorialsEnabled.toString() , project);
		ofy().save().entity(this).now();
	}

}
