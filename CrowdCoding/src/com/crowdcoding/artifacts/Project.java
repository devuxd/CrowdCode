package com.crowdcoding.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.Worker;
import com.crowdcoding.microtasks.Microtask;
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
	@Id private long id = 1L;
	
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
		ObjectifyService.register(Microtask.class);
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
		
		// Create two initial artifacts to get work started.
		UserStory userStory1 = new UserStory(this);
		UserStory userStory2 = new UserStory(this);
		
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
	
}
