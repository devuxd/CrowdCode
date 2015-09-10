package com.crowdcoding.history;

import com.crowdcoding.entities.artifacts.Artifact;
import com.crowdcoding.entities.microtasks.Microtask;

public class MicrotaskUnassigned extends MicrotaskEvent 
{
	public String workerID;
	
	public MicrotaskUnassigned(Microtask microtask, String workerID)
	{
		super("unassigned",microtask);
		this.workerID = workerID;
	}
}
