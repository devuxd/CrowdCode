package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;


public class TestDescriptionDTO extends DTO
{
	public String messageType = "TestDescriptionDTO";

	public String description;
	public String code;
	public List<String> simpleTestInputs = new ArrayList<String>();
	public String simpleTestOutput;
	public boolean readOnly;

	// Default constructor (required by Jackson JSON library)
	public TestDescriptionDTO()
	{
	}

	public TestDescriptionDTO(String description, List<String> simpleTestInputs, String simpleTestOutput, String code, boolean readOnly)
	{
		this.description = description;
		this.simpleTestInputs = simpleTestInputs;
		this.simpleTestOutput = simpleTestOutput;
		this.code = code;
		this.readOnly=readOnly;
	}
}
