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
import com.crowdcoding.entities.microtasks.MachineUnitTest;
import com.crowdcoding.entities.microtasks.Microtask;
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
	private LinkedList<Long> microtaskQueue = new LinkedList<Long>();			// Global queue of microtasks waiting to be done
	private LinkedList<Long> reviewQueue = new LinkedList<Long>();			// Global queue of review microtasks waiting to be done
	@Serialize private Map<String, Long> microtaskAssignments = new HashMap<String, Long>(); // Map from workerID to microtaskID; workers with no microtask have a null entry

	// Workers that are currently excluded from doing the microtask. This set may change over time as workers
	// skip and this count is reset. This list is always a superset of permanentlyExcludedWorkers.
	// Map from microtaskID to a set of workerIDs.
	@Serialize private Map<Long, HashSet<String>> excludedWorkers = new HashMap<Long, HashSet<String>>();

	// Workers that are permanently excluded from doing a microtask. In constrast to excludedWorkers, this set only
	// grows over time. Map from microtaskID to a set of workerIDs
	@Serialize private Map<Long, HashSet<String>> permanentlyExcludedWorkers = new HashMap<Long, HashSet<String>>();
	@Serialize private HashSet<String> loggedInWorkers = new HashSet<String>();

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
	public void queueMicrotask(long microtaskID, String excludedWorkerID)
	{
		microtaskQueue.addLast(microtaskID);
		if (excludedWorkerID != null)
			addPermExcludedWorkerForMicrotask(microtaskID, excludedWorkerID);

		ofy().save().entity(this).now();

		FirebaseService.writeMicrotaskQueue(new QueueInFirebase(microtaskQueue), project);
	}

	// Queues the microtask onto the project's review microtask queue
	public void queueReviewMicrotask(long microtaskID, String excludedWorkerID)
	{
		reviewQueue.addLast(microtaskID);
		addPermExcludedWorkerForMicrotask(microtaskID, excludedWorkerID);

		ofy().save().entity(this).now();

		FirebaseService.writeReviewQueue(new QueueInFirebase(reviewQueue), project);
	}

	private void addPermExcludedWorkerForMicrotask(long microtaskID, String excludedWorkerID)
	{
		HashSet<String> permExcludedForMicrotask = permanentlyExcludedWorkers.get(microtaskID);
		if (permExcludedForMicrotask == null)
		{
			permExcludedForMicrotask = new HashSet<String>();
			permanentlyExcludedWorkers.put(microtaskID, permExcludedForMicrotask);
		}
		permExcludedForMicrotask.add(excludedWorkerID);
		addExcludedWorkerForMicrotask(microtaskID, excludedWorkerID);
	}

	// Gets the currently assigned microtask for the specified worker or returns null if the worker
	// does not have a currently assigned microtask. Returns the microtaskID of the microtask.
	public Long lookupMicrotaskAssignment(String workerID)
	{
		return microtaskAssignments.get(workerID);
	}

	// Logs out the specified worker, clearing all of their current assigned work
	public void logoutWorker(String workerID)
	{
		Long currentAssignment = microtaskAssignments.get(workerID);

		// TODO: if the current assignment is a review, this should go in the review queue!

		if (currentAssignment != null)
			microtaskQueue.add(currentAssignment);

		microtaskAssignments.put(workerID, null);

		ofy().save().entity(this).now();

		FirebaseService.writeWorkerLoggedOut(workerID, this);
		FirebaseService.writeMicrotaskQueue(new QueueInFirebase(microtaskQueue), project);
	}

	// Assigns a microtask to worker and returns its microtaskID. Returns null if no microtasks are available.
	public Long assignMicrotask(String workerID, String workerHandle)
	{
		// Ensure that the worker is marked as logged in
		loggedInWorkers.add(workerID);

		// Look for a microtask, checking constraints on it along the way
		Long microtaskID = null;

		// First, check if there any review microtasks queued. Review microtasks get priority, as
		// they need to be done quickly.
		for (Long potentialMicrotask : reviewQueue)
		{
			if (assignmentIsValid(potentialMicrotask, workerID))
			{
				microtaskID = potentialMicrotask;
				break;
			}
		}

		if (microtaskID != null)
		{
			reviewQueue.remove(microtaskID);
			FirebaseService.writeReviewQueue(new QueueInFirebase(reviewQueue), project);
		}
		else
		{
			// If no suitable microtask has yet been found, continue looking in the global microtask queue.
			for (Long potentialMicrotask : microtaskQueue)
			{
				if (assignmentIsValid(potentialMicrotask, workerID))
				{
					microtaskID = potentialMicrotask;
					break;
				}
			}

			if (microtaskID != null)
			{
				microtaskQueue.remove(microtaskID);
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
		if (microtaskID == null)
		{
			ofy().save().entity(this).now();
			return null;
		}
		else
		{
			microtaskAssignments.put(workerID, microtaskID);
			FirebaseService.writeMicrotaskAssigned(microtaskID, workerID, workerHandle, this, true);

			ofy().save().entity(this).now();
			return microtaskID;
		}

		// TODO: we should store this to firebase somewhere.
		//microtask.assignmentTimeInMillis = System.currentTimeMillis();
	}

	// Checks both the excludedWorkers and skippedWorkers to see if microtaskID is a valid
	// microtask assignment for workerID. Returns true iff this is the case.
	private boolean assignmentIsValid(Long microtaskID, String workerID)
	{
		HashSet<String> microtaskExcludedWorkers = excludedWorkers.get(microtaskID);
		if (microtaskExcludedWorkers != null && microtaskExcludedWorkers.contains(workerID))
			return false;
		else
			return true;
	}

	// Called to process a microtask submission based on form data (in json format)
	// If the microtask has previously been submitted or is no longer open, the submission is
	// dropped, ensuring workers cannot submit against already completed microtasks.
	public void submitMicrotask(long microtaskID, Class microtaskType, String jsonDTOData, String workerID,
			Project project)
	{
		System.out.println("Handling microtask submission: " + microtaskID + " " + jsonDTOData);

		// Unassign the microtask from the worker
		microtaskAssignments.put(workerID, null);
		ofy().save().entity(this).now();

		// If reviewing is enabled and there is not a review microtask
		// for the current non-review microtask,
		// spawn a new review microtask to let the crowd review the work
		if (reviewingEnabled && !microtaskType.equals(Review.class))
		{
			MicrotaskCommand.createReview(microtaskID, workerID, jsonDTOData, workerID);
		}
		else
		{
			MicrotaskCommand.submit(microtaskID, jsonDTOData, workerID);
		}
	}

	// Unassigns worker from this microtask
	// Precondition - the worker must be assigned to this microtask
	public void skipMicrotask(long microtaskID, String workerID, Project project)
	{
		// Unassign the microtask from the worker and exclude the worker
		microtaskAssignments.put(workerID, null);
		addExcludedWorkerForMicrotask(microtaskID, workerID);

		// Add the work back to the appropriate queue
		// TODO: this should be added to the review queue if appropriate
		microtaskQueue.addLast(microtaskID);

		resetIfAllSkipped(microtaskID, project);

		ofy().save().entity(this).now();
		MicrotaskCommand.skip(microtaskID, workerID);
	}

	private void addExcludedWorkerForMicrotask(long microtaskID, String workerID)
	{
		HashSet<String> excludedWorkersForMicrotask = excludedWorkers.get(microtaskID);
		if (excludedWorkersForMicrotask == null)
		{
			excludedWorkersForMicrotask = new HashSet<String>();
			excludedWorkers.put(microtaskID, excludedWorkersForMicrotask);
		}

		excludedWorkersForMicrotask.add(workerID);
	}

	// Checks the microtask to see if all workers have skipped it. If so, resets the
	// excluded workers to give workers another chance.
	private void resetIfAllSkipped(long microtaskID, Project project)
	{
		HashSet<String> excludedWorkersForMicrotask = excludedWorkers.get(microtaskID);
		if (excludedWorkersForMicrotask.containsAll(loggedInWorkers))
		{
			excludedWorkersForMicrotask.clear();

			// Add back the permanently excluded workers
			HashSet<String> permanentlyExcludedWorkersForMicrotask = permanentlyExcludedWorkers.get(microtaskID);
			if (permanentlyExcludedWorkersForMicrotask != null)
				excludedWorkersForMicrotask.addAll(permanentlyExcludedWorkersForMicrotask);

			ofy().save().entity(this).now();

			System.out.println("Reset excluded workers for microtask " + microtaskID);
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
