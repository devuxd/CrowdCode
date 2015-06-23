package com.crowdcoding.dto.ajax.microtask.submission;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ClientRequestDTO;


public class FunctionDescriptionDTO extends DTO
{
	public String messageType = "FunctionDescriptionDTO";

	public String name;
	public String returnType;
	public List<FunctionParameterDTO> parameters = new ArrayList<FunctionParameterDTO>();
	public String header;
	public String description;
	public List<StubDTO> stubs = new ArrayList<StubDTO>();

	// Default constructor (required by Jackson JSON library)
	public FunctionDescriptionDTO()
	{
	}
}
