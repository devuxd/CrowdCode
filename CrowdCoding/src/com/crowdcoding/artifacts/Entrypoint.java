package com.crowdcoding.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.Project;
import com.crowdcoding.dto.FunctionDescriptionDTO;
import com.crowdcoding.microtasks.Microtask;
import com.crowdcoding.microtasks.WriteEntrypoint;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class Entrypoint extends Artifact 
{
	@Load protected Ref<Microtask> microtask;
	protected Ref<Function> function;
	protected Ref<UserStory> userStory;
	
	// Constructor for deserialization
	protected Entrypoint()
	{
	}
	
	// Constructor for initial creation
	public Entrypoint(Project project, UserStory userStory)
	{	
		super(project);
		
		this.userStory = (Ref<UserStory>) Ref.create(userStory.getKey());
		
		// Initial state of an entrypoint is no content. To create content, a microtask is spawned.	
		WriteEntrypoint writeEntrypoint = new WriteEntrypoint(this, project);
		this.microtask = Ref.create(writeEntrypoint.getKey());		
		
		ofy().save().entity(this).now();
	}

	// Sets the initial content for the entrypoint. 
	public void setInitial(FunctionDescriptionDTO dto, Project project)
	{
		// Create a new function for this entrypoint. This will spawn a new microtask to create it.
		Function function = new Function(dto.name, dto.description, dto.returnType, dto.parameters, project);		
		
		this.function = (Ref<Function>) Ref.create(function.getKey());
		this.microtask = null;
		ofy().save().entity(this).now();		
	}	
	
	public UserStory getUserStory()
	{
		return ofy().load().ref(userStory).get();
	}
		
	public String getName() 
	{ 
		if (function != null)
		{
			return ofy().load().ref(function).get().getName();
		}
		else
		{
			return "";
		}		
	}
}
