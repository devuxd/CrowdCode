package com.crowdcoding.dto.ajax.microtask.submission;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;


public class FunctionDTO extends DTO
{
	public String messageType = "FunctionDTO";

	public String description;
	public String returnType;
	public List<FunctionParameterDTO> parameters = new ArrayList<FunctionParameterDTO>();
	public String header;
	public String name;
	public String code ;
	public List<Long> calleeIds = new ArrayList<Long>();
	public List<StubDTO> stubs = new ArrayList<StubDTO>();

}
