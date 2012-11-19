package com.crowdcoding.artifacts;

import com.googlecode.objectify.annotation.Embed;

@Embed
public class Parameter 
{
	public String name;
	public String type;
	public String description;
	
	// Constructor for deserialization
	protected Parameter()
	{
	}	
	
	public Parameter(String name, String type, String description)
	{
		this.name = name;
		this.type = type;
		this.description = description;
	}
	
	public String toString()
	{
		return type + " " + name + " //" + description;		
	}
	
	public String getName()
	{
		return name;
	}
}
