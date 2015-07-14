package com.crowdcoding.dto.ajax.microtask.submission;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;


public class ImplementBehaviorDTO extends DTO
{
	public String messageType = "ImplementBehaviorDTO";

	public FunctionDTO function;
	public List< ADTDTO > requestedADTs = new ArrayList< ADTDTO>();
	public List< FunctionDTO > requestedFunctions = new ArrayList< FunctionDTO>();
	public List< TestDisputedDTO > disputedTests = new ArrayList< TestDisputedDTO >();
}
