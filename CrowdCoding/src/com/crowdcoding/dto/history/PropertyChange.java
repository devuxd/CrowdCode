package com.crowdcoding.dto.history;

import com.crowdcoding.artifacts.Artifact;

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
