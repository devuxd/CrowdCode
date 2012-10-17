package com.crowdcoding.dto;

import java.util.List;

public class EntrypointDTO 
{
	public List<ParameterDTO> parameters;
	public String name;
	public String event;
	
	public String toString()
	{
		return event + " function " + name + "(" + parameters.toString() + ")";
	}
}
