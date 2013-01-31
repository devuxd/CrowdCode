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
import com.crowdcoding.dto.DTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;
import com.googlecode.objectify.cmd.LoadType;

@EntitySubclass(index=true)
public class DebugTestFailure extends Microtask 
{
	@Load private Ref<Function> function;

	// Default constructor for deserialization
	private DebugTestFailure() 
	{				
	}

	// Constructor for initial construction
	public DebugTestFailure(Function function, Project project)
	{
		super(project);
		this.function = (Ref<Function>) Ref.create(function.getKey());		
		ofy().save().entity(this).now();
	}
	
	public void onAssign()
	{
		System.out.println("DebugTestFailure for " + function.get().getName() + " setting active coding");
		function.get().activeCodingStarted();
	}

	protected void doSubmitWork(DTO dto, Project project)
	{
		function.get().debugTestFailureCompleted((FunctionDTO) dto, project);	
	}

	protected Class getDTOClass()
	{
		return FunctionDTO.class;
	}

	public String getUIURL()
	{
		return "/html/DebugTestFailure.jsp";
	}

	public String getFunctionCode()
	{
		return function.getValue().getEscapedCode();
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
	
	public String getAllActiveFunctions()
	{
		List<Function> listOFunctions = ofy().load().type(Function.class).list();
		StringBuilder b = new StringBuilder();
		for(Function function : listOFunctions)
		{
			// todo: what does it mean to be equal?
			// if current function we are debugging equals
			// the loop then skip do not add again because 
			// current function's code may be different since
			// user is editing it
			if(function.getKey().equals(this.function.getKey()))
			{
				continue;
			}
			b.append(function.getFunctionHeader());
			b.append("{");
			b.append(function.getEscapedCode());
			b.append("}");
		}
		return b.toString();
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
