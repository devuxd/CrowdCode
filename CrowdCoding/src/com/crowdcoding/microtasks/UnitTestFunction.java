package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Project;
import com.crowdcoding.artifacts.Test;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.MicrotaskDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class UnitTestFunction extends Microtask 
{
	@Load private Ref<Function> function;

	// Default constructor for deserialization
	private UnitTestFunction() 
	{				
	}

	// Constructor for initial construction
	public UnitTestFunction(Ref<Function> function2, Project project)
	{
		super(project);
		this.function = (Ref<Function>) Ref.create(function2.getKey());		
		ofy().save().entity(this).now();
	}

	protected void doSubmitWork(MicrotaskDTO dto, Project project)
	{
		function.get().unitTestCorrectionCompleted((FunctionDTO) dto, project);	
	}

	protected Class getDTOClass()
	{
		return FunctionDTO.class;
	}

	public String getUIURL()
	{
		return "/html/unittest.jsp";
	}

	public String getFunctionCode()
	{
		return function.getValue().getCode();
	}
	
	public String[] getTestCases()
	{
		List<Ref<Test>> tempCases = function.getValue().getTestCases();
		String [] stringVersion = new String[tempCases.size()];
		int i = 0;
		for(Ref<Test>  temp : tempCases)
		{
			if(temp != null)
			{
				if(temp.getValue() != null)
				{
					if(temp.getValue().getTestCode() != null)
					{
						stringVersion[i] = temp.getValue().getTestCode();
					}
					i++;
				}
			}
		}
		return stringVersion;
	}
	
	public String[] getTestDescriptions()
	{
		List<Ref<Test>> tempCases = function.getValue().getTestCases();
		String [] stringVersion = new String[tempCases.size()];
		int i = 0;
		for(Ref<Test>  temp : tempCases)
		{
			if(temp != null)
			{
				if(temp.getValue() != null)
				{
					if(temp.getValue().getTestCode() != null)
					{
						stringVersion[i] = temp.getValue().getDescription();
					}
					i++;
				}
			}
		}
		return stringVersion;
	}
	
	
	public String getFunctionHeaderAssociatedWithTestCase()
	{
		return function.getValue().getFunctionHeader();
	}
	
	public Function getFunction()
	{
		return function.getValue();
	}
}
