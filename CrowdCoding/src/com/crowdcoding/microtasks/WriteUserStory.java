package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;

import com.crowdcoding.Project;
import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.UserStory;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.TestCasesDTO;
import com.crowdcoding.dto.UserStoryDTO;
import com.crowdcoding.dto.history.MicrotaskSpawned;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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
	public WriteUserStory(UserStory userStory, Project project)
	{
		super(project);
		this.userStory = (Ref<UserStory>) Ref.create(userStory.getKey());		
		ofy().save().entity(this).now();
		
		project.historyLog().beginEvent(new MicrotaskSpawned(this, userStory));
		project.historyLog().endEvent();
	}
	
	protected void doSubmitWork(DTO dto, Project project)
	{
		userStory.get().submitInitialText(((UserStoryDTO) dto).text, project);
	}
	
	protected Class getDTOClass()
	{
		return UserStoryDTO.class;
	}	
	
	public String getUIURL()
	{
		return "/html/userstory.jsp";
	}
	
	public Artifact getOwningArtifact()
	{
		return userStory.get();
	}
	
	public String microtaskTitle()
	{
		return "Write a user story";
	}
	
	public String microtaskDescription()
	{
		return "writing a user story";
	}
}
