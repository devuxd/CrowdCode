package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Parameter;

public class ParameterDTO extends DTO
{
	public String messageType = "ParameterDTO";	
	
	public String name;
	public String type;
	public String description;
	
	// Default constructor (required by Jackson JSON library)
	public ParameterDTO()
	{		
	}
	
	public ParameterDTO(String name, String type, String description) 
	{
		this.name = name;
		this.type = type;
		this.description = description;
	}
	
	public String toString()
	{
		return type + " " + name + " //" + description;		
	}
	
	// Returns a JSON string for all of the parameters in the specified function
	public static String getParamsJSON(Function function)
	{		
		List<ParameterDTO> dtos = new ArrayList<ParameterDTO>();
		for (Parameter param : function.getParameters())
			dtos.add(param.getDTO());
		
		return json(dtos);
	}
}
