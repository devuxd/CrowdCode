package com.crowdcoding.history;

import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.microtasks.Microtask;

public class MicrotaskAssigned extends MicrotaskEvent 
{
	public String workerID;
	
	public MicrotaskAssigned(Microtask microtask, String workerID)
	{
		super("assigned",microtask);
		this.workerID = workerID;
	}
}
