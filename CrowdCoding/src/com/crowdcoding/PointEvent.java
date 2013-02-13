package com.crowdcoding;

import com.crowdcoding.artifacts.Project;
import com.crowdcoding.dto.PointEventDTO;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Parent;

@Entity
public class PointEvent 
{
	@Parent private Key<Project> project;
	@Id private long id;
	public int points;	
	public String description;
	
	// Default constructor. ONLY to be used by Objectify.
	public PointEvent()
	{		
	}
	
	public PointEvent(int points, String description, Project project)
	{
		this.project = project.getKey();
		this.points = points;
		this.description = description;
		id = project.generateID("PointEvent");
	}	
	
	public PointEventDTO buildDTO()
	{
		return new PointEventDTO(points, description);
	}
	
	public Key<PointEvent> getKey()
	{
		return Key.create(project, PointEvent.class, id);
	}
}
