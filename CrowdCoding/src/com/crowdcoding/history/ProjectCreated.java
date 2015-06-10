package com.crowdcoding.history;

import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.Project;

public class ProjectCreated extends HistoryEvent 
{
	public String eventType = "project.create";

	public String projectID;
	
	public ProjectCreated(Project project)
	{
		super();
		this.projectID = project.getID();
	}
}
