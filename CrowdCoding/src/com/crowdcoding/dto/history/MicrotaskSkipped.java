package com.crowdcoding.dto.history;

import com.crowdcoding.microtasks.Microtask;

public class MicrotaskSkipped extends MicrotaskSubmitted
{
	public String eventType = "MicrotaskSkipped";
	
	public MicrotaskSkipped(Microtask microtask, String workerID)
	{
		super(microtask, workerID);
	}
}
