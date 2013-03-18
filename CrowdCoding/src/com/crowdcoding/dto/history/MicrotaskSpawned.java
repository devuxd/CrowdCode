package com.crowdcoding.dto.history;

import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.microtasks.Microtask;

public class MicrotaskSpawned extends HistoryEvent 
{
	public String eventType = "MicrotaskSpawned";
	
	public String microtaskType;
	public String microtaskID;
	
	public MicrotaskSpawned(Microtask microtask, Artifact artifact)
	{
		super(artifact);
		this.microtaskType = microtask.microtaskName();
		this.microtaskID = Long.toString(microtask.getID());
	}
}
