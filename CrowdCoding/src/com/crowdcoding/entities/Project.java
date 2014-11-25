package com.crowdcoding.entities;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Map;

import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.commands.MicrotaskCommand;
import com.crowdcoding.commands.ProjectCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.FunctionDescriptionDTO;
import com.crowdcoding.dto.FunctionDescriptionsDTO;
import com.crowdcoding.dto.firebase.QueueInFirebase;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.entities.microtasks.ReuseSearch;
import com.crowdcoding.entities.microtasks.Review;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.util.FirebaseService;
import com.crowdcoding.util.IDGenerator;
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
	@Ignore private HistoryLog historyLog;	// created and lives only for a single session; not persisted to datastore

	private boolean reviewingEnabled = true;			// Disabling this flag stops new review microtasks from being generated
	private boolean waitingForTestRun = false;								// is the project currently waiting for tests to be run?
	private LinkedList< String > microtaskQueue = new LinkedList< String >();			// Global queue of microtasks waiting to be done
	private LinkedList< String > reviewQueue = new LinkedList< String >();			// Global queue of review microtasks waiting to be done
	 
	// Map from workerID to microtaskID; workers with no microtask have a null entry
	@Serialize private Map< String, String > microtaskAssignments = new HashMap<String, String >();

	// Workers that are currently excluded from doing the microtask. This set may change over time as workers
	// skip and this count is reset. This list is always a superset of permanentlyExcludedWorkers.
	// Map from microtaskID to a set of workerIDs.
	@Serialize private Map< String, HashSet<String>> excludedWorkers = new HashMap< String , HashSet<String>>();

	// Workers that are permanently excluded from doing a microtask. In constrast to excludedWorkers, this set only
	// grows over time. Map from microtaskID to a set of workerIDs
	@Serialize private Map< String , HashSet<String>> permanentlyExcludedWorkers = new HashMap< String, HashSet<String>>();
	@Serialize private HashSet<String> loggedInWorkers = new HashSet<String>();


	public static String MicrotaskKeyToString( Key<Microtask> key ){
		if( key == null )
			return "";
		return key.getParent().getId()+"-"+key.getId();
	}
	
	public static Key<Microtask> StringToMicrotaskKey( String string ){
		if( string == null || string.length() == 0 )
			return null;
		String[] ids = string.split("-");
		System.out.println("Converting microtask key string in: "+ids[0]+"-"+ids[1]);
		Key<Artifact> parentKey = Key.create(Artifact.class, Integer.parseInt(ids[0]) );
		return Key.create(parentKey,Microtask.class, Integer.parseInt(ids[1]));
	}
	
	// Default constructor for deserialization only
	private Project()
	{
		
	}

	// Constructor for initial creation (flag is ignored)
	private Project(String id)
	{
		System.out.println("Creating new project");

		this.historyLog = new HistoryLog();
		this.id = id;

		// Setup the project to be ready
		idgenerator = new IDGenerator(false);

		ofy().save().entity(this).now();

		// Load ADTs from Firebase
		FirebaseService.copyADTs(this);

		// Load functions from Firebase
		String functions = FirebaseService.readClientRequestFunctions(this);
		FunctionDescriptionsDTO functionsDTO = (FunctionDescriptionsDTO) DTO.read(functions, FunctionDescriptionsDTO.class);
		for (FunctionDescriptionDTO functionDTO : functionsDTO.functions)
		{
			FunctionCommand.create(functionDTO.name, functionDTO.returnType, functionDTO.paramNames,
					functionDTO.paramTypes,functionDTO.paramDescriptions, functionDTO.header, functionDTO.description, functionDTO.code);
		}

		ofy().save().entity(this).now();
	}

	// Loads a project instance from the datastore.
	public static Project Create(String id)
	{
		// Need to use an ancestor query to do this inside a transaction. But the ancestor of project is project.
		// So we just create a normal key with only the type and id
		project = ofy().load().key(Key.create(Project.class, id)).get();

		// When a project is intialized (above), the history log is created inside the project constructor.
		// It has to be created there because it must be created before the project can be initialized.
		// When the project is loaded from the datastore, we create a fresh history log here.
		project.historyLog = new HistoryLog();

		return project;
	}

	// Creates a new project instance. This can only be called for a project that does not yet exist
	// (or that has been reset using Clear).
	public static Project Construct(String id)
	{
		return new Project(id);
	}

	// Clears the default project, returning it to the initial state
	public static void Clear(String projectID)
	{
		// Clear data for the project in firebase
		FirebaseService.clear(projectID);

		Key<Project> project = Key.create(Project.class, projectID);

		// Get microtasks, workers, artifacts (roots of the entity trees) of anything related to project
		Iterable<Key<Worker>> workers = ofy().transactionless().load().type(Worker.class).ancestor(project).keys();
		Iterable<Key<Artifact>> artifacts = ofy().transactionless().load().type(Artifact.class).ancestor(project).keys();
		Iterable<Key<Microtask>> microtasks = ofy().transactionless().load().type(Microtask.class).ancestor(project).keys();

		// Delete each
		ofy().transactionless().delete().keys(workers);
		ofy().transactionless().delete().keys(artifacts);
		ofy().transactionless().delete().keys(microtasks);

		// delete project
		ofy().transactionless().delete().key(project);
	}

	//////////////////////////////////////////////////////////////////////////////
	//  Microtask Queue Management
	//////////////////////////////////////////////////////////////////////////////

	// Queues the microtask onto the project's global queue
	// Provides an optional parameter (which may be left null) for an excludedWorker,
	// who, if provided, will be permanently excluded from doing the microtask.
	public void queueMicrotask(Key<Microtask> microtaskKey, String excludedWorkerID)
	{
		microtaskQueue.addLast( Project.MicrotaskKeyToString(microtaskKey) );
		if (excludedWorkerID != null)
			addPermExcludedWorkerForMicrotask(microtaskKey, excludedWorkerID);

		ofy().save().entity(this).now();

		FirebaseService.writeMicrotaskQueue(new QueueInFirebase(microtaskQueue), project);
	}

	// Queues the microtask onto the project's review microtask queue
	public void queueReviewMicrotask(Key<Microtask> microtaskKey, String excludedWorkerID)
	{
		reviewQueue.addLast(  Project.MicrotaskKeyToString(microtaskKey) );
		addPermExcludedWorkerForMicrotask(microtaskKey, excludedWorkerID);

		ofy().save().entity(this).now();

		FirebaseService.writeReviewQueue(new QueueInFirebase(reviewQueue), project);
	}

	private void addPermExcludedWorkerForMicrotask(Key<Microtask> microtaskKey, String excludedWorkerID)
	{
		HashSet<String> permExcludedForMicrotask = permanentlyExcludedWorkers.get(microtaskKey);
		if (permExcludedForMicrotask == null)
		{
			permExcludedForMicrotask = new HashSet<String>();
			permanentlyExcludedWorkers.put(  Project.MicrotaskKeyToString(microtaskKey) , permExcludedForMicrotask);
		}
		permExcludedForMicrotask.add(excludedWorkerID);
		addExcludedWorkerForMicrotask(microtaskKey, excludedWorkerID);
	}

	// Gets the currently assigned microtask for the specified worker or returns null if the worker
	// does not have a currently assigned microtask. Returns the microtaskID of the microtask.
	public Key<Microtask> lookupMicrotaskAssignment(String workerID)
	{
		String microtaskKeyString =  microtaskAssignments.get(workerID);
		
		// if the string is null return null
		if( microtaskKeyString == null ) return null;
		
		return Project.StringToMicrotaskKey(microtaskKeyString);
	}
	
	public void logoutInactiveWorkers(){
		for ( String workerId : loggedInWorkers){
			if( ! FirebaseService.isWorkerLoggedIn( workerId, this) ){
				System.out.println("LOGGING OUT "+workerId);
				this.logoutWorker( workerId );
			}
		}
	}
	
	// Logs out the specified worker, clearing all of their current assigned work
	public void logoutWorker(String workerID)
	{
		String microtaskKeyString = microtaskAssignments.get(workerID);
		Key<Microtask> currentAssignment = Project.StringToMicrotaskKey(microtaskKeyString);

		// TODO: if the current assignment is a review, this should go in the review queue!

		if (currentAssignment != null)
			microtaskQueue.add(  Project.MicrotaskKeyToString(currentAssignment) );

		microtaskAssignments.put(workerID, null);

		ofy().save().entity(this).now();

		FirebaseService.writeWorkerLoggedOut(workerID, this);
		FirebaseService.writeMicrotaskQueue(new QueueInFirebase(microtaskQueue), project);
	}

	// Assigns a microtask to worker and returns its microtaskID. Returns null if no microtasks are available.
	public Key<Microtask> assignMicrotask(String workerID, String workerHandle)
	{
		// Ensure that the worker is marked as logged in
		loggedInWorkers.add(workerID);

		// Look for a microtask, checking constraints on it along the way
		Key<Microtask> microtaskKey = null;

		// First, check if there any review microtasks queued. Review microtasks get priority, as
		// they need to be done quickly.
		for (String potentialMicrotask : reviewQueue)
		{
			if (assignmentIsValid(potentialMicrotask, workerID))
			{
				microtaskKey = Project.StringToMicrotaskKey(potentialMicrotask);
				break;
			}
		}

		System.out.println("REVIEW KEY = "+microtaskKey);
		
		if ( microtaskKey != null )
		{
			reviewQueue.remove( Project.MicrotaskKeyToString( microtaskKey ) );
			FirebaseService.writeReviewQueue(new QueueInFirebase(reviewQueue), project);
		}
		else
		{
			// If no suitable microtask has yet been found, continue looking in the global microtask queue.
			for (String potentialMicrotask : microtaskQueue)
			{
				
				if (assignmentIsValid( potentialMicrotask, workerID))
				{
					microtaskKey =  Project.StringToMicrotaskKey(potentialMicrotask) ;
					break;
				}
			}

			if ( microtaskKey != null )
			{
				microtaskQueue.remove( Project.MicrotaskKeyToString( microtaskKey ) );
				FirebaseService.writeMicrotaskQueue(new QueueInFirebase(microtaskQueue), project);
			}
		}
		

		System.out.println("MICROTASK KEY = "+microtaskKey);

		// TODO: we need to check if the microtask is no longer needed

		// 2. If the microtask is no longer needed, keep looking
		/*if (!potentialMicrotask.isStillNeeded(project))
		{
			potentialMicrotask.markCompleted(project);
			continue microtaskSearch;
		}*/

		// If there are no more microtasks currently available, return null
		if ( microtaskKey == null)
		{
			ofy().save().entity(this).now();
			return null;
		}
		else
		{
			microtaskAssignments.put(workerID,  Project.MicrotaskKeyToString(microtaskKey) );
			FirebaseService.writeMicrotaskAssigned( Project.MicrotaskKeyToString(microtaskKey), workerID, workerHandle, this, true);

			ofy().save().entity(this).now();
			return microtaskKey;
		}

		// TODO: we should store this to firebase somewhere.
		//microtask.assignmentTimeInMillis = System.currentTimeMillis();
	}

	// Checks both the excludedWorkers and skippedWorkers to see if microtaskID is a valid
	// microtask assignment for workerID. Returns true iff this is the case.
	private boolean assignmentIsValid(String potentialMicrotask, String workerID)
	{
		HashSet<String> microtaskExcludedWorkers = excludedWorkers.get(potentialMicrotask);
		if (microtaskExcludedWorkers != null && microtaskExcludedWorkers.contains(workerID))
			return false;
		else
			return true;
	}

	// Called to process a microtask submission based on form data (in json format)
	// If the microtask has previously been submitted or is no longer open, the submission is
	// dropped, ensuring workers cannot submit against already completed microtasks.
	public void submitMicrotask(Key<Microtask> microtaskKey, Class microtaskType, String jsonDTOData, String workerID,
			Project project)
	{
		System.out.println("Handling microtask submission: " + microtaskKey + " " + jsonDTOData);

		// Unassign the microtask from the worker
		microtaskAssignments.put(workerID, null);
		ofy().save().entity(this).now();

		// If reviewing is enabled and there is not a review microtask
		// for the current non-review microtask,
		// spawn a new review microtask to let the crowd review the work
		if (reviewingEnabled && !( microtaskType.equals(Review.class) || microtaskType.equals(ReuseSearch.class)) )
		{
			MicrotaskCommand.createReview(microtaskKey, workerID, jsonDTOData, workerID);
		}
		else
		{
			MicrotaskCommand.submit(microtaskKey, jsonDTOData, workerID);
		}
	}

	// Unassigns worker from this microtask
	// Precondition - the worker must be assigned to this microtask
	public void skipMicrotask(Key<Microtask> microtaskKey, String workerID, Project project)
	{
		// Unassign the microtask from the worker and exclude the worker
		microtaskAssignments.put(workerID, null);
		addExcludedWorkerForMicrotask(microtaskKey, workerID);

		// Add the work back to the appropriate queue
		// TODO: this should be added to the review queue if appropriate
		microtaskQueue.addLast(  Project.MicrotaskKeyToString(microtaskKey) );

		resetIfAllSkipped(microtaskKey, project);

		ofy().save().entity(this).now();
		MicrotaskCommand.skip( microtaskKey, workerID);
	}

	private void addExcludedWorkerForMicrotask(Key<Microtask> microtaskKey, String workerID)
	{
		HashSet<String> excludedWorkersForMicrotask = excludedWorkers.get(microtaskKey);
		if (excludedWorkersForMicrotask == null)
		{
			excludedWorkersForMicrotask = new HashSet<String>();
			excludedWorkers.put(  Project.MicrotaskKeyToString(microtaskKey) , excludedWorkersForMicrotask);
		}

		excludedWorkersForMicrotask.add(workerID);
	}

	// Checks the microtask to see if all workers have skipped it. If so, resets the
	// excluded workers to give workers another chance.
	private void resetIfAllSkipped(Key<Microtask> microtaskKey, Project project)
	{
		HashSet<String> excludedWorkersForMicrotask = excludedWorkers.get( Project.MicrotaskKeyToString(microtaskKey) );
		if (excludedWorkersForMicrotask.containsAll(loggedInWorkers))
		{
			excludedWorkersForMicrotask.clear();

			// Add back the permanently excluded workers
			HashSet<String> permanentlyExcludedWorkersForMicrotask = permanentlyExcludedWorkers.get( Project.MicrotaskKeyToString(microtaskKey) );
			if (permanentlyExcludedWorkersForMicrotask != null)
				excludedWorkersForMicrotask.addAll(permanentlyExcludedWorkersForMicrotask);

			ofy().save().entity(this).now();

			System.out.println("Reset excluded workers for microtask " + microtaskKey);
		}
	}

	// Publishes the history log to Firebase
	public void publishHistoryLog()
	{
		FirebaseService.publishHistoryLog(historyLog.json(), this);
	}

	// Requests that the tests be run for the project
	public void requestTestRun()
	{
		// Schedule a MachineUnitTest to be run, if one is not already scheduled
		if (!waitingForTestRun)
		{
			waitingForTestRun = true;
			ofy().save().entity(this).now();
			//Microtask microtask = new MachineUnitTest(this);
			//ProjectCommand.queueMicrotask(microtask.getID(), null);
		}
	}

	// Notifies the project that tests are currently out and about to run
	public void testsAboutToRun()
	{
		// Reset the waitingForTestRun, as the current tests to be run are now frozen and any
		// subsequent changes to the tests or functions will not be reflected in the current test
		// run.
		waitingForTestRun = false;
		ofy().save().entity(this).now();
	}

	public void enableReviews(boolean reviewsEnabled)
	{
		this.reviewingEnabled = reviewsEnabled;
		ofy().save().entity(this).now();
	}

	public long generateID(String tag)
	{
		long id = idgenerator.generateID(tag);

		// State of embedded object (id generator) changed, so state must be saved.
		ofy().save().entity(this).now();

		return id;
	}

	public Key<Project> getKey()
	{
		return Key.create(Project.class, id);
	}

	public String getID()
	{
		return id;
	}

	public HistoryLog historyLog()
	{
		return historyLog;
	}
}
