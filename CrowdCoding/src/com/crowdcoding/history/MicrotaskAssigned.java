package com.crowdcoding.history;

import com.crowdcoding.entities.artifacts.Artifact;
import com.crowdcoding.entities.microtasks.Microtask;

public class MicrotaskAssigned extends MicrotaskEvent 
{
	public String workerID;
	
	
	public MicrotaskAssigned(Microtask microtask, String workerID, String type)
	{
		super(type,microtask);
		this.workerID = workerID;
	}
}
