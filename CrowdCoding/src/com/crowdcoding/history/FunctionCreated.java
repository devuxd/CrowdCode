package com.crowdcoding.history;

import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.artifacts.Artifact;

public class FunctionCreated extends HistoryEvent
{
	public String eventType = "function.create";

	public long functionId;

	public FunctionCreated(long functionId)
	{
		super();
		this.functionId = functionId;
	}
}
