package com.crowdcoding.dto.history;

import com.crowdcoding.artifacts.Artifact;

public class StateChange extends HistoryEvent 
{
	public String eventType = "StateChange";

	public String newState;	
	
	public StateChange(String newState, Artifact artifact)
	{
		super(artifact);
		this.newState = newState;
	}
}
