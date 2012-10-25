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

@EntitySubclass(index=true)
public class Function extends Artifact
{
	private String code;
	private String name;
	private List<Parameter> parameters = new ArrayList<Parameter>();  	
	private List<Ref<Test>> tests = new ArrayList<Ref<Test>>();
	
	// Constructor for deserialization
	protected Function()
	{
	}
	
	public Function(String name, List<ParameterDTO> params, Project project)
	{
		super(project);
		
		this.name = name;
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
}
