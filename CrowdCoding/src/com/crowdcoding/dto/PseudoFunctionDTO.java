package com.crowdcoding.dto;


public class PseudoFunctionDTO extends DTO
{
	public String messageType = "PseudoFunctionDTO";

	public String name        ="";
	public String description ="";

	//Default constructor (required by Jackson JSON library)
	public PseudoFunctionDTO()
	{

	}

	public PseudoFunctionDTO(String name, String description)
	{
		this.name=name;
		this.description=description;
	}
}
