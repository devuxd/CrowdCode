package com.crowdcoding.history;

import java.util.Date;

import com.crowdcoding.dto.DTO;
import com.crowdcoding.entities.artifacts.Artifact;

/* A HistoryEvent captures a CrowdCoding event that is logged into the history stream.
 */
public abstract class HistoryEvent extends DTO 
{
	public String parentID;			// ID of the parent. Null if there is no parent.
	
	public String artifactType;     // { Entrypoint, Function, UserStory, Test } 
	public String artifactID;
	public String artifactName;		// may be empty for artifacts with no name
	
	public String timestamp;		// timestamp of the event to the nearest second
	public String timeInMillis;		// more accurate timestamp, formatted as milliseconds since Jan 1, 1970
	
	public HistoryEvent()
	{	
		this.artifactID   = "";
		this.artifactType = "";
		this.artifactName = "";
		
		Date currentTime = new Date();		
		this.timestamp    = currentTime.toString();
		this.timeInMillis = Long.toString(System.currentTimeMillis());		
	}
	
	protected void setArtifact(Artifact artifact){
		if (artifact != null)
		{
			this.artifactID   = Long.toString(artifact.getId());
			this.artifactType = artifact.getArtifactType();
			this.artifactName = artifact.getName();
		}
	}
	
	// Generates the unique ID for this history event.
	public String generateID()
	{
		// Concatenate timeInMillis with the artifact type and ID. The goal is to have an id
		// that is highly likely to be globally unique across the entire project. As long as there are not
		// multiple changes to the same artifact within a single millisecond, this is true.
		return timeInMillis + "-" + artifactType + "-"+ artifactID;		
	}
	
	public String getEventType(){
		return "";
	}
}
