package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;


public class FunctionDTO extends DTO
{
	public String messageType = "FunctionDTO";

	public Long testId;
	public String description;
	public String returnType;
	public List<String> paramNames = new ArrayList<String>();
	public List<String> paramTypes = new ArrayList<String>();
	public List<String> paramDescriptions = new ArrayList<String>();
	public String header;
	public String name;
	public String code = "";
	public List<Long> calleeIds = new ArrayList<Long>();
	public List<TestDTO> stubs = new ArrayList<TestDTO>();
	public List<PseudoFunctionDTO> pseudoFunctions = new ArrayList<PseudoFunctionDTO>();
	public Boolean autoSubmit;
	public String disputeText;

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

    	for(int i=0; i<paramNames.size(); i++)
			{
			if(paramDescriptions.size()>i)
				fullDescription += "  @param " + paramTypes.get(i) + ' ' + paramNames.get(i) + " - " + paramDescriptions.get(i) + "\n";

			}


		fullDescription += "\n  @return " + returnType + " \n**/\n\n";

		return fullDescription;
	}
}
