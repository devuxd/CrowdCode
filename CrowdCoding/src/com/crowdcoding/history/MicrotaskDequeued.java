package com.crowdcoding.history;

import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.microtasks.Microtask;

public class MicrotaskDequeued extends MicrotaskEvent 
{	
	public MicrotaskDequeued(Microtask microtask)
	{
		super("dequeued", microtask);
	}
}
