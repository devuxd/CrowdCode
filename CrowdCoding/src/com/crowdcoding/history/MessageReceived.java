package com.crowdcoding.history;

import com.crowdcoding.entities.artifacts.Artifact;

public class MessageReceived extends HistoryEvent 
{
	public String eventType = "message.received";

	public String messageType;		// { AddCall, PassedTests, FailedTests } 
	
	public MessageReceived(String messageType, Artifact artifact)
	{
		super();
		this.setArtifact(artifact);
		this.messageType = messageType;
	}
}
