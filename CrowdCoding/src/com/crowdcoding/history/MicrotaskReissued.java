package com.crowdcoding.history;

import com.crowdcoding.entities.artifacts.Artifact;
import com.crowdcoding.entities.microtasks.Microtask;

public class MicrotaskReissued extends MicrotaskEvent 
{
	public String workerID;
	
	public MicrotaskReissued(Microtask microtask, String reviewerID)
	{
		super("reissued", microtask);
		this.workerID    = reviewerID;
	}
}
