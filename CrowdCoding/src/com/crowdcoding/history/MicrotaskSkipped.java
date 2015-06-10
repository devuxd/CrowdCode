package com.crowdcoding.history;

import com.crowdcoding.entities.microtasks.Microtask;

public class MicrotaskSkipped extends MicrotaskEvent
{
	public String workerID;
	
	public MicrotaskSkipped(Microtask microtask, String workerID)
	{
		super("skipped",microtask);
		this.workerID = workerID;
	}
}
