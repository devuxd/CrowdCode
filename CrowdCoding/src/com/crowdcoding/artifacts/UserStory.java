package com.crowdcoding.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.microtasks.Microtask;
import com.crowdcoding.microtasks.WriteUserStory;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class UserStory extends Artifact
{
	@Load protected Ref<Microtask> microtask;
	protected Ref<Entrypoint> entrypoint;
	protected String text;
	
	// Constructor for deserialization
	protected UserStory()
	{
	}
	
	// Constructor for initial creation
	public UserStory(Project project)
	{	
		super(project);
		
		// Initial state of the user story is an empty user story.
		// To create content, a write user story microtask is created.		
		WriteUserStory writeUserStory = new WriteUserStory(this, project);
		this.microtask = Ref.create(writeUserStory.getKey());		
		
		ofy().save().entity(this).now();
	}

	// Sets the text for the user story. This transitions the state of the artifact from
	// empty (waiting for text) to has initial text.
	public void submitInitialText(String text, Project project)
	{
		this.text = text;
		this.microtask = null;
		
		// Transitioning generates a new Entrypoint artifact
		Entrypoint entrypoint = new Entrypoint(project);
		this.entrypoint = (Ref<Entrypoint>) Ref.create(entrypoint.getKey());
		ofy().save().entity(this).now();
	}
}
