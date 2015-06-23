package com.crowdcoding.dto.ajax.microtask.submission;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;

public class DescribeFunctionBehaviourDTO extends DTO
{

	public int functionVersion;		// version of the function under test that the worker saw when authoring this test.
	public List<TestDTO> testSuite = new ArrayList<TestDTO>();
	public boolean isFunctionComplete;

	// Default constructor (required by Jackson JSON library)
	public DescribeFunctionBehaviourDTO()
	{
	}
}
