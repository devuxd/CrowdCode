package com.crowdcoding.history;

import com.crowdcoding.entities.artifacts.Artifact;

public class ArtifactCreated extends HistoryEvent
{
	public String eventType = "artifact.created";

	public ArtifactCreated( Artifact artifact )
	{
		super();
		this.setArtifact(artifact);
	}

	public String getEventType(){
		return eventType;
	}
}
