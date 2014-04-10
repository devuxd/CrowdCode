package com.crowdcoding.dto;

import java.util.HashMap;

public class ReturnTypesDTO extends DTO 
{
	public String messageType = "ReturnTypesDTO";

	// A list of function names and the corresponding full escaped description for each.
	public HashMap<String, String> functionNameToReturnType;

	// Default constructor (required by Jackson JSON library)
	public ReturnTypesDTO()
	{		
	}

	public ReturnTypesDTO(HashMap<String, String> functionNameToReturnType) 
	{
		this.functionNameToReturnType = functionNameToReturnType;
	}
	
	public String toString()
	{
		return functionNameToReturnType.toString();
	}
}
