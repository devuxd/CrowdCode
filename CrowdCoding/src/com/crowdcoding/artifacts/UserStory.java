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
	protected String text;
	
	// Constructor for deserialization
	protected UserStory()
	{
	}
	
	// Constructor for initial creation
	public UserStory(Project project)
	{	
		super(false);
		
		// Initial state of the user story is an empty user story.
		// To create content, a write user story microtask is created.		
		WriteUserStory writeUserStory = WriteUserStory.Create(this, project);
		this.microtask = Ref.create(writeUserStory.getKey());		
		
		ofy().save().entity(this);
	}

	public void setText(String text)
	{
		this.text = text;
		ofy().save().entity(this);
	}
}
