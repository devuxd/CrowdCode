package com.crowdcoding.dto.history;

import com.crowdcoding.artifacts.Artifact;

public class MessageReceived extends HistoryEvent 
{
	public String eventType = "MessageReceived";

	public String messageType;		// { AddCall, PassedTests, FailedTests } 
	
	public MessageReceived(String messageType, Artifact artifact)
	{
		super(artifact);
		this.messageType = messageType;
	}
}
