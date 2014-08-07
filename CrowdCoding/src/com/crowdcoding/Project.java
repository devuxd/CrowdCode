package com.crowdcoding;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Map;

import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.commands.FunctionCommand;
import com.crowdcoding.artifacts.commands.MicrotaskCommand;
import com.crowdcoding.artifacts.commands.ProjectCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.FunctionDescriptionDTO;
import com.crowdcoding.dto.FunctionDescriptionsDTO;
import com.crowdcoding.microtasks.MachineUnitTest;
import com.crowdcoding.microtasks.Microtask;
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
	
	private boolean waitingForTestRun = false;								// is the project currently waiting for tests to be run?
	private LinkedList<Long> microtaskQueue = new LinkedList<Long>();			// Global queue of microtasks waiting to be done
	@Serialize private Map<String, Long> microtaskAssignments = new HashMap<String, Long>(); // Map from workerID to microtaskID; workers with no microtask have a null entry	
	@Serialize private Map<Long, HashSet<String>> excludedWorkers = new HashMap<Long, HashSet<String>>(); // Map from microtaskID to a set of workerIDs that are excluded from doing the microtask
	
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
		System.out.println(functions);	
		FunctionDescriptionsDTO functionsDTO = (FunctionDescriptionsDTO) DTO.read(functions, FunctionDescriptionsDTO.class);
		for (FunctionDescriptionDTO functionDTO : functionsDTO.functions)
		{
			FunctionCommand.create(functionDTO.name, functionDTO.returnType, functionDTO.paramNames, 
					functionDTO.paramTypes, functionDTO.header, functionDTO.description, functionDTO.code);					
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
	public void queueMicrotask(long microtaskID)
	{
		microtaskQueue.addLast(microtaskID);
		ofy().save().entity(this).now();
		
		FirebaseService.writeMicrotaskReady(microtaskID, this);
	}
	
	// Gets the currently assigned microtask for the specified worker or returns null if the worker
	// does not have a currently assigned microtask. Returns the microtaskID of the microtask.
	public Long lookupMicrotaskAssignment(String workerID)
	{
		return microtaskAssignments.get(workerID);		
	}

	// Assigns a microtask to worker and returns its microtaskID. Returns null if no microtasks are available.
	public Long assignMicrotask(String workerID)
	{		
		// Look for a microtask, checking constraints on it along the way
		Long microtaskID = null;

		for (Long potentialMicrotask : microtaskQueue)
		{
			// If the worker is excluded from doing it, keep looking
			HashSet<String> microtaskExcludedWorkers = excludedWorkers.get(potentialMicrotask);
			
			if (microtaskExcludedWorkers != null && microtaskExcludedWorkers.contains(workerID))
				continue;
			
			// A microtask was found!
			microtaskID = potentialMicrotask;
			break;			
		}
		
		// TODO: we need to check if the microtask is no longer needed
		
		// 2. If the microtask is no longer needed, keep looking
		/*if (!potentialMicrotask.isStillNeeded(project))
		{
			potentialMicrotask.markCompleted(project);
			continue microtaskSearch;
		}*/
		
		// If there are no more microtasks currently available, return null
		if (microtaskID == null)
		{
			return null;
		}
		else
		{
			System.out.println(workerID);
			
			microtaskQueue.remove(microtaskID);
			microtaskAssignments.put(workerID, microtaskID);
			FirebaseService.writeMicrotaskAssigned(microtaskID, workerID, this);
			
			ofy().save().entity(this).now();
			return microtaskID;
		}

		// TODO: we should store this to firebase somewhere.
		//microtask.assignmentTimeInMillis = System.currentTimeMillis();
	}
	
	// Called to process a microtask submission based on form data (in json format)
	// If the microtask has previously been submitted or is no longer open, the submission is
	// dropped, ensuring workers cannot submit against already completed microtasks.
	public void submitMicrotask(long microtaskID, String jsonDTOData, String workerID, Project project)
	{	
		System.out.println("Handling microtask submission: " + microtaskID + " " + jsonDTOData);
		
		// Unassign the microtask from the worker
		microtaskAssignments.put(workerID, null);
		ofy().save().entity(this).now();

		MicrotaskCommand.submit(microtaskID, jsonDTOData, workerID);
	} 
	
	// Unassigns worker from this microtask
	// Precondition - the worker must be assigned to this microtask
	public void skipMicrotask(long microtaskID, String workerID, Project project)
	{
		// Unassign the microtask from the worker and exclude the worker
		microtaskAssignments.put(workerID, null);
		
		HashSet<String> excludedWorkersForMicrotask = excludedWorkers.get(microtaskID);
		if (excludedWorkersForMicrotask == null)
		{
			excludedWorkersForMicrotask = new HashSet<String>();
			excludedWorkers.put(microtaskID, excludedWorkersForMicrotask);			
		}
		
		excludedWorkersForMicrotask.add(workerID);
		// TODO: check if there are now too many excluded workers... We may need to keep
		// the list of logged in workers in the project to do this?
		
		ofy().save().entity(this).now();
		MicrotaskCommand.skip(microtaskID, workerID);		
	}
	
	// Checks the microtask to see if most workers have skipped it. If so, resets the
	// excluded workers to give workers another chance.
	private void resetIfHighlySkipped(Project project)
	{
		// If all workers have skipped it, reset exclusion constraints.
		// TODO: we really should reset based on the status of logged in workers. But there
		// is currently no way to track that accurately.
		if (excludedWorkers.size() >= Worker.allWorkers(project).size())
		{
			excludedWorkers.clear();
			ofy().save().entity(this).now();
			
			System.out.println("Reset excluded workers for " + this.toString());
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
			new MachineUnitTest(this);			
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
