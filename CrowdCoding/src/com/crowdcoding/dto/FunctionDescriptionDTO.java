package com.crowdcoding.dto;

import java.util.List;

public class FunctionDescriptionDTO extends DTO 
{
	public String messageType = "FunctionDescriptionDTO";
	
	public List<ParameterDTO> parameters;
	public String name;
	public String description;
	public String returnType;
	
	// Default constructor (required by Jackson JSON library)
	public FunctionDescriptionDTO()
	{		
	}

	public FunctionDescriptionDTO(String name, String returnType, List<ParameterDTO> parameters,  
			String description) 
	{
		this.parameters = parameters;
		this.name = name;
		this.description = description;
		this.returnType = returnType;
	}
	
	public String toString()
	{
		return description + "\n" + returnType + " function " + name + 
				"(" + parameters.toString() + ")";
	}
}
