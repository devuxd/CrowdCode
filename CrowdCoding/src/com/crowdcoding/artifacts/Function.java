package com.crowdcoding.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.ParameterDTO;
import com.crowdcoding.dto.TestCasesDTO;
import com.crowdcoding.microtasks.SketchFunction;
import com.crowdcoding.microtasks.WriteTestCases;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class Function extends Artifact
{
	private String code;
	private String name;
	private String description;
	private String returnType;
	@Load private List<Parameter> parameters = new ArrayList<Parameter>();  	
	@Load private List<Ref<Test>> tests = new ArrayList<Ref<Test>>();
	
	// Constructor for deserialization
	protected Function()
	{
	}
	
	public Function(String name, String description, String returnType, List<ParameterDTO> params, Project project)
	{
		super(project);
		
		this.name = name;
		this.description = description;
		this.returnType = returnType;
		for (ParameterDTO param : params)
			this.parameters.add(new Parameter(param.name, param.type, param.description));
		
		ofy().save().entity(this).now();
		
		// Spawn off microtasks to 1) write test cases and 2) sketch the method
		WriteTestCases writeTestCases = new WriteTestCases(this, project);
		SketchFunction sketchFunction = new SketchFunction(this, project);	
	}
	
	public void writeTestCasesCompleted(TestCasesDTO dto, Project project)
	{
		for (String testDescription : dto.tests)
		{
			Test test = new Test(testDescription, this, project);
			tests.add((Ref<Test>) Ref.create(test.getKey()));
		}
		
		ofy().save().entity(this).now();			
	}
	
	public void sketchCompleted(FunctionDTO dto, Project project)
	{
		this.code = dto.code;				
		ofy().save().entity(this).now();		
	}	
	
	public void unitTestCorrectionCompleted(FunctionDTO dto, Project project)
	{
		this.code = dto.code;
		ofy().save().entity(this).now();
	}
	
	public String getCode()
	{
		return code;
	}
	
	public List<Ref<Test>> getTestCases()
	{
		return tests;
	}
	// this the header used for code. it is valid js
	public String getFunctionHeader()
	{
		StringBuilder parameterAsAString = new StringBuilder();
		for(Parameter functionParameter: parameters)
		{
			parameterAsAString.append(functionParameter.getName());
			parameterAsAString.append(",");
		}
		parameterAsAString.replace(parameterAsAString.toString().length()-1,parameterAsAString.toString().length(), "");
		return "function " + this.name + "(" + parameterAsAString.toString() + ")" ;
	}

	public String getReturnType()
	{
		return returnType;
	}

	public String getDescription() 
	{
		return description;
	}

	// this has the type and the description
	public String getFunctionDisplayHeader() 
	{
		StringBuilder parameterAsAString = new StringBuilder();
		for(Parameter functionParameter: parameters)
		{
			parameterAsAString.append(functionParameter.toString());
			parameterAsAString.append(",<br>");
		}
		parameterAsAString.replace(parameterAsAString.toString().length()-5,parameterAsAString.toString().length(), "");
		return "function " + this.name + "(</br>" + parameterAsAString.toString() + "</br>)" ;
	}
}
