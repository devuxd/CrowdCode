package com.crowdcoding.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.Project;
import com.crowdcoding.microtasks.Microtask;
import com.crowdcoding.microtasks.WriteFunction;
import com.crowdcoding.microtasks.WriteTestCases;
import com.crowdcoding.microtasks.WriteUserStory;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.cmd.Query;

@EntitySubclass(index=true)
public class UserStory extends Artifact
{
	protected String text;
	protected Ref<Microtask> microtask;
	
	// Constructor for deserialization
	protected UserStory()
	{
	}
	
	// Constructor to create a user story with crowdsourced text from a WriteUserStory microtask.
	public UserStory(Project project)
	{	
		super(project);
		
		// Save this entity before WriteUserStory is created, as it requires us to already be created as
		// an entity (in WriteUserStory.getOwningArtifact()).
		ofy().save().entity(this).now();
		
		// Initial state of the user story is an empty user story.
		// To create content, a write user story microtask is created.		
		WriteUserStory writeUserStory = new WriteUserStory(this, project);
		this.microtask = Ref.create(writeUserStory.getKey());		
		
		ofy().save().entity(this).now();
	}
	
	// Constructor to create an empty UserStory and do nothing
	private UserStory(Project project, boolean ignoredFlag)
	{	
		super(project);		
	}
	
	// Creates a user story with the specified text, returning a microtask to start working on
	public static Microtask CreateUserStory(String text, Project project)
	{
		UserStory userStory = new UserStory(project, true);
		return userStory.submitInitialText(text, project);
	}	
	
	// Sets the text for the user story. This transitions the state of the artifact from
	// empty (waiting for text) to has initial text.
	// The function returns a microtask that can be started working on.
	public Microtask submitInitialText(String text, Project project)
	{
		this.text = text;
		this.microtask = null;
		
		Function mainFunction = project.getMainFunction();
		
		// Create a write function microtask to implement this functionality
		mainFunction.queueMicrotask(new WriteFunction(mainFunction, this, project), project);
		
		// And create tests to test this functionality
		Microtask microtask = new WriteTestCases(mainFunction, this, project);
		
		ofy().save().entity(this).now();
		
		return microtask;
	}
	
	public String getText()
	{
		return text;
	}
	
	public String getName()
	{
		return "UserStory" + id;
	}
	
	// Gets the currently associated microtask, or null if none exists.
	public Microtask getMicrotask()
	{
		return ofy().load().ref(microtask).get();
	}
	
	public String toString()
	{
		return getName() + ": '"+ text.split("\n")[0] + "'"; 
	}
	
	public static String StatusReport(Project project)
	{
		StringBuilder output = new StringBuilder();
		
		output.append("**** ALL USER STORIES ****\n");
		
		Query<UserStory> q = ofy().load().type(UserStory.class).ancestor(project.getKey());		
		for (UserStory userStory : q)
			output.append(userStory.toString() + "\n");
		
		return output.toString();
	}
}
