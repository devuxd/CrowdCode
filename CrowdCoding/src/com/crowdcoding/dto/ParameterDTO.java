package com.crowdcoding.dto;

public class ParameterDTO 
{
	public String name;
	public String type;
	public String description;
	
	public String toString()
	{
		return type + " " + name + " //" + description;		
	}
}
