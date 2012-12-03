package com.crowdcoding.dto;

public class ParameterDTO extends DTO
{
	public String messageType = "ParameterDTO";	
	
	public String name;
	public String type;
	public String description;
	
	public String toString()
	{
		return type + " " + name + " //" + description;		
	}
}
