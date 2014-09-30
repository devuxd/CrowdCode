package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;


public class FunctionDescriptionDTO extends DTO 
{
	public String messageType = "FunctionDescriptionDTO";
	
	public String name;
	public String returnType;
	public List<String> paramNames = new ArrayList<String>();
	public List<String> paramTypes = new ArrayList<String>();
	public List<String> paramDescriptions = new ArrayList<String>();
	public String header;
	public String description;
	public String code;
	
	// Description includes all comments and the signature block itself. e.g.,
	// // A description of foo, describing what it does and its parameters and return value.
	
	// Header consists of the header: e.g., 
	// function foo(arg1, arg2)
	
	// Default constructor (required by Jackson JSON library)
	public FunctionDescriptionDTO()
	{		
	}

	public FunctionDescriptionDTO(String name, String returnType, List<String> paramNames, List<String> paramTypes, 
			 List<String> paramDescriptions, String header, String description) 	
	{
		this.name = name;
		this.returnType = returnType;
		this.paramNames = paramNames;
		this.paramTypes = paramTypes;
		this.paramDescriptions = paramDescriptions;
		this.header = header;
		this.description = description;
	}
	
	public String toString()
	{
		return description + "\n" + header;
	}
}
