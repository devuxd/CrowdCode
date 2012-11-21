package com.crowdcoding.dto;

import java.util.List;

public class EntrypointDTO extends MicrotaskDTO
{
	public List<ParameterDTO> parameters;
	public String name;
	public String description;
	public String returnType;
	public String event;
	
	public String toString()
	{
		return description + "\n" + event + ": " + returnType + " function " + name + 
				"(" + parameters.toString() + ")";
	}
}
