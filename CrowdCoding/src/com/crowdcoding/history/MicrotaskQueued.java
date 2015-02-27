package com.crowdcoding.history;

import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.microtasks.Microtask;

public class MicrotaskQueued extends MicrotaskEvent 
{	
	public MicrotaskQueued(Microtask microtask)
	{
		super("queued", microtask);
	}
}
