package com.crowdcoding.dto.ajax;

import org.apache.commons.lang3.StringEscapeUtils;

import com.crowdcoding.dto.DTO;
import com.crowdcoding.entities.Artifacts.Test;


public class TestResultDTO extends DTO
{

	public boolean areTestsPassed;
	public long functionId;
	public long failedTestId;


	// Default constructor
	public TestResultDTO()
	{
	}

}
