package com.crowdcoding.history;

import com.crowdcoding.entities.Artifacts.Artifact;
import com.crowdcoding.entities.microtasks.Microtask;

public class MicrotaskDequeuedFromWorkerQueue extends MicrotaskEvent
{
	public MicrotaskDequeuedFromWorkerQueue(Microtask microtask)
	{
		super("dequeuedFromWorkerQueue", microtask);
	}
}
