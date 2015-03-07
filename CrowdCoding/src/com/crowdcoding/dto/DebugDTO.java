package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;


public class DebugDTO extends DTO
{
	public String messageType = "DebugDTO";

	public FunctionDTO functionDTO;
	public List<TestDTO> stubs = new ArrayList<TestDTO>();
	public List<TestDisputedDTO> disputedTests = new ArrayList<TestDisputedDTO>();
	public Boolean autoSubmit;
	public Boolean hasPseudo;
	
	public String toString()
	{
		return "\n debug test failure for function "+functionDTO.name;
	}

}
