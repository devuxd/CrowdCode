package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Project;
import com.crowdcoding.artifacts.UserStory;
import com.crowdcoding.dto.UserStoryDTO;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;


@EntitySubclass(index=true)
public class WriteUserStory extends Microtask
{	
	 @Load private Ref<UserStory> userStory;
	
	// Default constructor for deserialization
	private WriteUserStory()
	{		
	}
	
	// Constructor for initial construction
	protected WriteUserStory(UserStory userStory, Project project)
	{
		super(project);
		this.userStory = (Ref<UserStory>) Ref.create(userStory.getKey());		
		ofy().save().entity(this).now();
	}
	
	public static WriteUserStory Create(UserStory userStory, Project project)
	{
		return new WriteUserStory(userStory, project);
	}
	
	// Completes the microtask, with the data provided by the DTO
	public void submit(UserStoryDTO dto, Worker worker)
	{
		userStory.get().setText(dto.text);	
		this.completed = true;
		worker.setMicrotask(null);
		ofy().save().entity(this);
	}
	
	public String getUIURL()
	{
		return "/html/userstory.jsp";
	}
}
