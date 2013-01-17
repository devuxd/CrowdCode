package com.crowdcoding.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.Leaderboard;
import com.crowdcoding.PointEvent;
import com.crowdcoding.Worker;
import com.crowdcoding.microtasks.DisputeUnitTestFunction;
import com.crowdcoding.microtasks.Microtask;
import com.crowdcoding.microtasks.ReuseSearch;
import com.crowdcoding.microtasks.SketchFunction;
import com.crowdcoding.microtasks.DebugTestFailure;
import com.crowdcoding.microtasks.WriteCall;
import com.crowdcoding.microtasks.WriteEntrypoint;
import com.crowdcoding.microtasks.WriteFunctionDescription;
import com.crowdcoding.microtasks.WriteTest;
import com.crowdcoding.microtasks.WriteTestCases;
import com.crowdcoding.microtasks.WriteUserStory;
import com.crowdcoding.util.IDGenerator;
import com.googlecode.objectify.ObjectifyService;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;

/*
 * Projects are the root of the artifact and microtask graphs. A project instance MUST be created before
 * any interactions with artifacts or microtasks can take place.
 */
@Entity
public class Project 
{
	private IDGenerator idgenerator;
	private Leaderboard leaderboard;
	@Id private long id = 1L;
	
	// Static initializer for class Project
	static
	{
		// Must register ALL entities and entity subclasses here.
		// And embedded classes are also not registered.
		ObjectifyService.register(Worker.class);
		ObjectifyService.register(PointEvent.class);
		ObjectifyService.register(Artifact.class);
		ObjectifyService.register(Entrypoint.class);
		ObjectifyService.register(Function.class);
		ObjectifyService.register(Project.class);
		ObjectifyService.register(Test.class);
		ObjectifyService.register(UserStory.class);
		
		ObjectifyService.register(DisputeUnitTestFunction.class);
		ObjectifyService.register(Microtask.class);
		ObjectifyService.register(ReuseSearch.class);
		ObjectifyService.register(SketchFunction.class);
		ObjectifyService.register(DebugTestFailure.class);
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
	private Project(boolean flag)
	{	
		System.out.println("Creating new project");	
		
		// Setup the project to be ready 
		idgenerator = new IDGenerator(false);
		leaderboard = new Leaderboard(this);
		
		// Create an initial artifact to get work started.
		UserStory userStory = new UserStory(this);
		
		ofy().save().entity(this).now();
	}
	
	// Creates a new project instance. If there is a project in the database, it will be backed by that project.
	// Otherwise, a new project will be created.
	public static Project Create()
	{
		Project project = ofy().load().type(Project.class).first().get();
		if (project == null)		
			project = new Project(false);			
			
		return project;
	}	
	
	public long generateID(String tag)
	{
		long id = idgenerator.generateID(tag);
		
		// State of embedded object (id generator) changed, so state must be saved.
		ofy().save().entity(this).now();
		
		return id;		
	}	
	
	public Leaderboard getLeaderboard()
	{
		return leaderboard;
	}

}
