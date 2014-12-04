package com.crowdcoding.history;

import com.crowdcoding.entities.Artifact;

public class MessageReceived extends HistoryEvent 
{
	public String eventType = "microtask.received";

	public String messageType;		// { AddCall, PassedTests, FailedTests } 
	
	public MessageReceived(String messageType, Artifact artifact)
	{
		super(artifact);
		this.messageType = messageType;
	}
}
