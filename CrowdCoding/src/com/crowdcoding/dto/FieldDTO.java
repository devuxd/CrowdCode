package com.crowdcoding.dto;

public class FieldDTO extends DTO 
{
	public String name;
	public String type;
	
	public FieldDTO()
	{		
	}
	
	public FieldDTO(String name, String type)
	{
		this.name = name;
		this.type = type;
	}
}
