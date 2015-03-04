package com.crowdcoding.dto;


public class FunctionParameterDTO extends DTO
{
	public String name        ="";
	public String type ="";
	public String description ="";

	//Default constructor (required by Jackson JSON library)
	public FunctionParameterDTO()
	{

	}

	public FunctionParameterDTO(String name,  String type,  String description)
	{
		this.name=name;
		this.type=type;
		this.description=description;
	}
}
