package com.crowdcoding.dto;

import java.util.List;


public class EntrypointDTO extends FunctionDescriptionDTO
{
	public String messageType = "EntrypointDTO";
	
	public String event;
	
	// Default constructor (required by Jackson JSON library)
	public EntrypointDTO()
	{		
	}	
	
	public EntrypointDTO(String event, String name, List<ParameterDTO> parameters, 
			String returnType, String description) 
	{
		super(name, returnType, parameters, description);
		this.event = event;
	}

	public String toString()
	{
		return description + "\n" + event + ": " + returnType + " function " + name + 
				"(" + parameters.toString() + ")";
	}
}
