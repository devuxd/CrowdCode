package com.crowdcoding.dto;

import java.util.List;

public class FunctionDescriptionsDTO extends DTO 
{
	public List<FunctionDescriptionDTO> functions;
	
	public FunctionDescriptionsDTO()
	{		
	}
	
	public FunctionDescriptionsDTO(List<FunctionDescriptionDTO> functions)
	{
		this.functions = functions;
	}	
}
