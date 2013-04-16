package com.crowdcoding;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.Entrypoint;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Test;
import com.crowdcoding.artifacts.UserStory;
import com.crowdcoding.dto.CurrentStatisticsDTO;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.UserStoriesDTO;
import com.crowdcoding.microtasks.DebugTestFailure;
import com.crowdcoding.microtasks.DisputeUnitTestFunction;
import com.crowdcoding.microtasks.MachineUnitTest;
import com.crowdcoding.microtasks.Microtask;
import com.crowdcoding.microtasks.ReuseSearch;
import com.crowdcoding.microtasks.WriteCall;
import com.crowdcoding.microtasks.WriteEntrypoint;
import com.crowdcoding.microtasks.WriteFunction;
import com.crowdcoding.microtasks.WriteFunctionDescription;
import com.crowdcoding.microtasks.WriteTest;
import com.crowdcoding.microtasks.WriteTestCases;
import com.crowdcoding.microtasks.WriteUserStory;
import com.crowdcoding.util.FirebaseService;
import com.crowdcoding.util.IDGenerator;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.ObjectifyService;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Ignore;

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
	private Leaderboard leaderboard;
	@Id private String id;
	private int writtenFunctions;
	private int linesOfCode;
	private int microtasksCompleted;
	@Ignore private HistoryLog historyLog;	// created and lives only for a single session; not persisted to datastore
	
	private Ref<Function> mainFunction;	// root function in the call graph
	
	private boolean waitingForTestRun = false;	// is the project currently waiting for tests to be run?
	
	// Static initializer for class Project
	static
	{
		// Must register ALL entities and entity subclasses here.
		// And embedded classes are also not registered.
		ObjectifyService.register(Worker.class);
		ObjectifyService.register(Artifact.class);
		ObjectifyService.register(Entrypoint.class);
		ObjectifyService.register(Function.class);
		ObjectifyService.register(Project.class);
		ObjectifyService.register(Test.class);
		ObjectifyService.register(UserStory.class);
		
		ObjectifyService.register(DisputeUnitTestFunction.class);
		ObjectifyService.register(Microtask.class);
		ObjectifyService.register(ReuseSearch.class);
		ObjectifyService.register(WriteFunction.class);
		ObjectifyService.register(DebugTestFailure.class);
		ObjectifyService.register(MachineUnitTest.class);
		ObjectifyService.register(WriteCall.class);
		ObjectifyService.register(WriteEntrypoint.class);
		ObjectifyService.register(WriteFunctionDescription.class);
		ObjectifyService.register(WriteTest.class);
		ObjectifyService.register(WriteTestCases.class);
		ObjectifyService.register(WriteUserStory.class);
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
		leaderboard = new Leaderboard(this);
		
		ofy().save().entity(this).now();
		
		// Create the main function
		Function function = new Function(this);
		mainFunction = (Ref<Function>) Ref.create(function.getKey());
		
		// Load user stories from Firebase and spawn work to implement them
		String userStories = FirebaseService.readUserStories(this);
		System.out.println(userStories);	
		UserStoriesDTO dto = (UserStoriesDTO) DTO.read(userStories, UserStoriesDTO.class);		
		for (String userStoryText : dto.userStories)
			new UserStory(userStoryText, this);
		
		ofy().save().entity(this).now();
	}
	
	// Creates a new project instance. If there is a project in the database, it will be backed by that project.
	// Otherwise, a new project will be created.
	public static Project Create(String id)
	{
		// Need to use an ancestor query to do this inside a transaction. But the ancestor of project is project.
		// So we just create a normal key with only the type and id
		project = ofy().load().key(Key.create(Project.class, id)).get();
		if (project == null)	
		{
			project = new Project(id);
		}
		else
		{
			// When a project is intialized (above), the history log is created inside the project constructor.
			// It has to be created there because it must be created before the project can be initialized.
			// When the project is loaded from the datastore, we create a fresh history log here.
			project.historyLog = new HistoryLog();
		}
		
		return project;
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
	
	// Publish new statistics to Firebase
	public void publishStatistics() 
	{
		CurrentStatisticsDTO stats = new CurrentStatisticsDTO(microtasksCompleted, linesOfCode, 
				writtenFunctions);
		FirebaseService.publishStatistics(stats.json(), this);		
	}
	
	// Publishes the history log to Firebase
	public void publishHistoryLog()
	{
		FirebaseService.publishHistoryLog(historyLog.json(), this);
	}
	
	// Report that a function is now written
	public void functionWritten()
	{
		writtenFunctions++;
		ofy().save().entity(this).now();
	}
	
	// Report that a function that was written is no longer written
	public void functionNotWritten()
	{
		writtenFunctions--;
		ofy().save().entity(this).now();
	}
	
	// Report that lines of code in the system increased by
	public void locIncreasedBy(int lines)
	{
		linesOfCode += lines;
		ofy().save().entity(this).now();
	}
	
	// Report that a microtask has been completed
	public void microtaskCompleted()
	{
		microtasksCompleted++;
		ofy().save().entity(this).now();
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
	
	public Leaderboard getLeaderboard()
	{
		return leaderboard;
	}

	public HistoryLog historyLog()
	{
		return historyLog;
	}
	
	// Gets the main function, the root of the call graph
	public Function getMainFunction()
	{
		return ofy().load().ref(mainFunction).get();
	}
}
