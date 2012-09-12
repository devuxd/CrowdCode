package com.crowdcoding.model;

public class Parameter 
{
	public String name;
	public String type;
	public String description;
	
	public String toString()
	{
		return type + " " + name + " //" + description;		
	}
}
