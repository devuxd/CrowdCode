package com.crowdcoding.history;

import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.microtasks.Microtask;

public class MicrotaskSpawned extends MicrotaskEvent 
{
	public String eventType = "microtask.spawned";
	
	public MicrotaskSpawned(Microtask microtask)
	{
		super("spawned",microtask);
		System.out.println("-- LOGGING MICROTASK SPAWN "+microtask.getID());
	}
}
