package com.crowdcoding.dto.ajax.microtask.submission;

import java.util.List;

import com.crowdcoding.dto.DTO;

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
