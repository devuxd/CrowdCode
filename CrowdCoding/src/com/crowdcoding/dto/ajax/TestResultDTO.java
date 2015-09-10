package com.crowdcoding.dto.ajax;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;


public class TestResultDTO extends DTO
{

	public boolean areTestsPassed;
	public long failedTestId;
	public List < Long > passedTestsId = new ArrayList< Long >();


	// Default constructor
	public TestResultDTO()
	{
	}

}
