package com.crowdcoding.dto.ajax.microtask.submission;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;


public class ImplementBehaviorDTO extends DTO
{
	public String messageType = "ImplementBehaviorDTO";

	public FunctionDTO function;
	public List < FunctionDescriptionDTO > addedFunctions = new ArrayList < FunctionDescriptionDTO >();
	public List< ADTDTO > ADT = new ArrayList< ADTDTO>();

	public List< TestDisputedDTO > disputedTests = new ArrayList< TestDisputedDTO >();

	public String disputeFunctionText ;

	public boolean functionNotImplementable;

}
