package com.crowdcoding.dto.ajax.microtask.submission;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;


public class FunctionDTO extends DTO
{
	public String messageType = "FunctionDTO";

	public Long testId;
	public String description;
	public String returnType;
	public List<FunctionParameterDTO> parameters = new ArrayList<FunctionParameterDTO>();
	public String header;
	public String name;
	public String code ;
	public List<Long> calleeIds = new ArrayList<Long>();
	public List<TestDTO> stubs = new ArrayList<TestDTO>();
	public List<TestDTO> disputedTests = new ArrayList<TestDTO>();
	public List<PseudoFunctionDTO> pseudoFunctions = new ArrayList<PseudoFunctionDTO>();
	public Boolean autoSubmit;
	public String disputeFunctionText ;
	public boolean inDispute;

	public String toString()
	{
		if(testId == null)
		{
			return description + "\n" + header + "\n" + code;
		}
		return description + "\n" + " function " + name + "test case number of function disputed: " + testId;
	}


	public String getCompleteDescription()
	{
		String fullDescription="/**\n" + description + "\n\n";

		return fullDescription + getParametersAndReturn();
	}
	public String getParametersAndReturn()
	{
		String fullDescription="";

    	for(FunctionParameterDTO parameter : parameters)
			fullDescription += "  @param " + parameter.type + ' ' + parameter.name + " - " + parameter.description + "\n";



		fullDescription += "\n  @return " + returnType + " \n**/\n\n";

		return fullDescription;
	}
}
