package com.crowdcoding.dto.ajax.microtask.submission;

import com.crowdcoding.dto.DTO;


public class PseudoFunctionDTO extends DTO
{
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
