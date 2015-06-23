package com.crowdcoding.history;

import com.crowdcoding.entities.Artifacts.Artifact;
import com.crowdcoding.entities.microtasks.Microtask;

public class MicrotaskQueued extends MicrotaskEvent 
{	
	public MicrotaskQueued(Microtask microtask)
	{
		super("queued", microtask);
	}
}
