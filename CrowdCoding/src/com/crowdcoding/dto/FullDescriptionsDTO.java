package com.crowdcoding.dto;

import java.util.HashMap;

public class FullDescriptionsDTO extends DTO 
{
	public String messageType = "FullDescriptionDTO";

	// A list of function names and the corresponding full escaped description for each.
	public HashMap<String, String> functionNameToDescription;

	// Default constructor (required by Jackson JSON library)
	public FullDescriptionsDTO()
	{		
	}

	public FullDescriptionsDTO(HashMap<String, String> functionNameToDescription) 
	{
		this.functionNameToDescription = functionNameToDescription;
	}
	
	public String toString()
	{
		return functionNameToDescription.toString();
	}
}
