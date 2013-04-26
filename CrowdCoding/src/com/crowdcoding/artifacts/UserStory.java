package com.crowdcoding.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.Project;
import com.crowdcoding.microtasks.Microtask;
import com.crowdcoding.microtasks.WriteFunction;
import com.crowdcoding.microtasks.WriteTestCases;
import com.crowdcoding.microtasks.WriteUserStory;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;

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
	
	// Constructor to create a user story with prespecified text.
	public UserStory(String text, Project project)
	{	
		super(project);		
		submitInitialText(text, project);
	}
	
	// Sets the text for the user story. This transitions the state of the artifact from
	// empty (waiting for text) to has initial text.
	public void submitInitialText(String text, Project project)
	{
		this.text = text;
		this.microtask = null;
		
		Function mainFunction = project.getMainFunction();
		
		// Create a write function microtask to implement this functionality
		mainFunction.queueMicrotask(new WriteFunction(mainFunction, this, project), project);
		
		// And create tests to test this functionality
		new WriteTestCases(mainFunction, this, project);
		
		ofy().save().entity(this).now();
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
}
