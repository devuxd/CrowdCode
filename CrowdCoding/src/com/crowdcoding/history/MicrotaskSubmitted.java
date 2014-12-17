package com.crowdcoding.history;

import com.crowdcoding.entities.microtasks.Microtask;

public class MicrotaskSubmitted extends MicrotaskEvent 
{
	public String workerID;
	public String timeWorkedOn;		// in milliseconds
	
	public MicrotaskSubmitted(Microtask microtask, String workerID)
	{
		super("submitted",microtask);
		
		this.workerID = workerID;
		this.timeWorkedOn = Long.toString(System.currentTimeMillis() - microtask.assignmentTimeInMillis());
	}
}
