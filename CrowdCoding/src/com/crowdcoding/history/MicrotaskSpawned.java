package com.crowdcoding.history;

import com.crowdcoding.entities.artifacts.Artifact;
import com.crowdcoding.entities.microtasks.Microtask;

public class MicrotaskSpawned extends MicrotaskEvent 
{
	public String eventType = "microtask.spawned";
	
	public MicrotaskSpawned(Microtask microtask)
	{
		super("spawned",microtask);
	}
}
