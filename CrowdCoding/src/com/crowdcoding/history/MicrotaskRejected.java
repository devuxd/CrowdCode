package com.crowdcoding.history;

import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.microtasks.Microtask;

public class MicrotaskRejected extends MicrotaskEvent 
{
	public String workerID;
	
	public MicrotaskRejected(Microtask microtask, String reviewerID)
	{
		super("rejected",microtask);
		this.workerID = reviewerID;
	}
}
