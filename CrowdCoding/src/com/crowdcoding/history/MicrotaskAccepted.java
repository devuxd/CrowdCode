package com.crowdcoding.history;

import com.crowdcoding.entities.Artifacts.Artifact;
import com.crowdcoding.entities.microtasks.Microtask;

public class MicrotaskAccepted extends MicrotaskEvent 
{
	public String workerID;
	
	public MicrotaskAccepted(Microtask microtask, String reviewerID)
	{
		super("accepted", microtask);
		this.workerID    = reviewerID;
	}
}
