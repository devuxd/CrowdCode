package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;

public class FunctionInFirebase extends DTO 
{
	public String messageType = "FunctionInFirebase";
	
	public String name;
	public long id;
	public String returnType;
	public List<String> paramNames = new ArrayList<String>();
	public List<String> paramTypes = new ArrayList<String>();
	public String header;
	public String description;
	public String code;
	public int linesOfCode;
	
	// Description includes all comments and the signature block itself. e.g.,
	// // A description of foo, describing what it does and its parameters and return value.
	
	// Header consists of the header: e.g., 
	// function foo(arg1, arg2)
	
	// Default constructor (required by Jackson JSON library)
	public FunctionInFirebase()
	{		
	}

	public FunctionInFirebase(String name, long id, String returnType, List<String> paramNames, 
			List<String> paramTypes, String header, String description, int linesOfCode) 	
	{
		this.name = name;
		this.id = id;
		this.returnType = returnType;
		this.paramNames = paramNames;
		this.paramTypes = paramTypes;
		this.header = header;
		this.description = description;
		this.linesOfCode = linesOfCode;
	}
	
	public String toString()
	{
		return description + "\n" + header;
	}
}
