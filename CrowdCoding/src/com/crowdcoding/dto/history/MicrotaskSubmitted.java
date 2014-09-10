package com.crowdcoding.dto.history;

import com.crowdcoding.microtasks.Microtask;

public class MicrotaskSubmitted extends HistoryEvent 
{
	public String eventType = "MicrotaskSubmitted";
	
	public String microtaskType;
	public String microtaskID;
	
	public String workerID;
	public String workerHandle;
	public String timeWorkedOn;		// in milliseconds
	
	public MicrotaskSubmitted(Microtask microtask, String workerID)
	{
		super(microtask.getOwningArtifact());
		
		this.microtaskType = microtask.microtaskName();
		this.microtaskID = Long.toString(microtask.getID());
		this.workerID = workerID;
		
		this.timeWorkedOn = Long.toString(System.currentTimeMillis() - microtask.assignmentTimeInMillis());
	}
}
