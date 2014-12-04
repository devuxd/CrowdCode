package com.crowdcoding.history;

import com.crowdcoding.entities.microtasks.Microtask;

public class MicrotaskSkipped extends MicrotaskSubmitted
{
	public String eventType = "microtask.skipped";
	
	public MicrotaskSkipped(Microtask microtask, String workerID)
	{
		super(microtask, workerID);
	}
}
