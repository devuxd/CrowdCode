package com.crowdcoding.history;

import com.crowdcoding.entities.artifacts.Artifact;
import com.crowdcoding.entities.microtasks.Microtask;

public class MicrotaskDequeuedFromWorkerQueue extends MicrotaskEvent
{
	public MicrotaskDequeuedFromWorkerQueue(Microtask microtask)
	{
		super("dequeuedFromWorkerQueue", microtask);
	}
}
