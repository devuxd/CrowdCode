package com.crowdcoding.history;

import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.microtasks.Microtask;

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
