package com.crowdcoding.history;

import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.microtasks.Microtask;

public class MicrotaskEvent extends HistoryEvent 
{
	public String eventType = "microtask";
	
	public String microtaskType;
	public String microtaskKey;
	
	public MicrotaskEvent(String eventType, Microtask microtask)
	{
		super();
		this.setArtifact(microtask.getOwningArtifact());
		
		this.eventType     += "." + eventType;
		this.microtaskType = microtask.microtaskName();
		this.microtaskKey  = Microtask.keyToString(microtask.getKey());
	}
	
	public String getEventType(){
		return eventType;
	}
}
