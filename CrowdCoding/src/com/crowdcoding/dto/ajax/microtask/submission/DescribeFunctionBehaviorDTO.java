package com.crowdcoding.dto.ajax.microtask.submission;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;

public class DescribeFunctionBehaviorDTO extends DTO
{

	public int functionVersion;		// version of the function under test that the worker saw when authoring this test.
	public List<TestDTO> tests = new ArrayList<TestDTO>();
	public boolean isDescribeComplete;

	// Default constructor (required by Jackson JSON library)
	public DescribeFunctionBehaviorDTO()
	{
	}
}
