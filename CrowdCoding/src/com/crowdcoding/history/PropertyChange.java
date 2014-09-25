package com.crowdcoding.history;

import com.crowdcoding.entities.Artifact;

public class PropertyChange extends HistoryEvent 
{
	public String eventType = "PropertyChange";

	public String propertyName;
	public String propertyValue;
	
	public PropertyChange(String propertyName, String propertyValue, Artifact artifact)
	{
		super(artifact);
		this.propertyName = propertyName;
		this.propertyValue = propertyValue;		
	}
}
