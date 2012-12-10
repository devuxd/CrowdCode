package com.crowdcoding.dto;

public class ParameterDTO extends DTO
{
	public String messageType = "ParameterDTO";	
	
	public String name;
	public String type;
	public String description;
	
	// Default constructor (required by Jackson JSON library)
	public ParameterDTO()
	{		
	}
	
	public ParameterDTO(String name, String type, String description) 
	{
		this.name = name;
		this.type = type;
		this.description = description;
	}
	
	public String toString()
	{
		return type + " " + name + " //" + description;		
	}
}
