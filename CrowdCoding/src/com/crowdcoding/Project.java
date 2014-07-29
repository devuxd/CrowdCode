package com.crowdcoding;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.List;

import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Test;
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
	
	private boolean waitingForTestRun = false;	// is the project currently waiting for tests to be run?
		
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
			Function newFunction = new Function(functionDTO.name, functionDTO.returnType, functionDTO.paramNames, 
					functionDTO.paramTypes, functionDTO.header, functionDTO.description, functionDTO.code, this);					
		}		
		
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
	
	public String statusReport()
	{
		StringBuilder output = new StringBuilder();
		output.append(Worker.StatusReport(this)); 
		output.append(Microtask.StatusReport(this));    
		output.append(Function.StatusReport(this));   
		output.append(Test.StatusReport(this));
		
		return output.toString();
	}
	
	// Lists detailed information for each test in the system.
	public String listTests()
	{
		return Test.allMocksInSystemEscaped(this);
	}
	
	// Lists detailed information for each function in the system.
	public String listFunctions()
	{
		StringBuilder output = new StringBuilder();
		List<Function> listOFunctions = ofy().load().type(Function.class).ancestor(project.getKey()).list();
		 
		for (Function function : listOFunctions)
			output.append(function.fullToString());
		
		return output.toString();
	}
}
