package com.crowdcoding.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.FunctionDescriptionDTO;
import com.crowdcoding.dto.ParameterDTO;
import com.crowdcoding.dto.ReusedFunctionDTO;
import com.crowdcoding.dto.TestCasesDTO;
import com.crowdcoding.microtasks.ReuseSearch;
import com.crowdcoding.microtasks.SketchFunction;
import com.crowdcoding.microtasks.WriteCall;
import com.crowdcoding.microtasks.WriteFunctionDescription;
import com.crowdcoding.microtasks.WriteTestCases;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Index;
import com.googlecode.objectify.annotation.Load;
import com.googlecode.objectify.cmd.Query;

@EntitySubclass(index=true)
public class Function extends Artifact
{
	private String code;
	@Index private String name;
	private String description;
	private String returnType;
	@Load private List<Parameter> parameters = new ArrayList<Parameter>();  	
	@Load private List<Ref<Test>> tests = new ArrayList<Ref<Test>>();
	
	// Constructor for deserialization
	protected Function()
	{
	}
	
	// Constructor for a function that already has a full function description
	public Function(String name, String description, String returnType, List<ParameterDTO> params, Project project)
	{
		super(project);
		writeDescriptionCompleted(name, description, returnType, params, project);
	}
	
	// Constructor for a function that only has a short call description and still needs a full description
	public Function(String callDescription, Project project)
	{
		super(project);
		
		// Spawn off a microtask to write the function description
		WriteFunctionDescription writeFunctionDescription = new WriteFunctionDescription(this, project);
	}
	
	// Gets a list of FunctionDescriptionDTOs for every function, formatted as a JSON string
	public static String getFunctionDescriptions()
	{
		List<FunctionDescriptionDTO> dtos = new ArrayList<FunctionDescriptionDTO>();
		Query<Function> q = ofy().load().type(Function.class);   
		for (Function function : q)
			dtos.add(function.getDescriptionDTO());
		
		ObjectMapper mapper = new ObjectMapper();
		try 
		{
		    return mapper.writeValueAsString(dtos);
		} catch (IOException e) {
			e.printStackTrace();
		}
	
	    return "";   
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
		// Look for lines that begin with a ! and spawn reuse searches for each
		int index = 0;
		
		// Create a new String with a \n at the beginning, so that ! on the first line will
		// still be matched.
		String searchCode = "\n" + code;
		
		while (true)
		{
			String callDescription;
		
			index = searchCode.indexOf("\n!", index);
			if (index == -1)
				break;
			
			 // We found a match. Take the whole line (or to the end if this is the last line)
			int nextLineStart = searchCode.indexOf("\n", index + 1);
			if (nextLineStart == -1)
				callDescription = searchCode.substring(index + 2);
			else 
				callDescription = searchCode.substring(index + 2, nextLineStart);
			
			ReuseSearch reuseSearch = new ReuseSearch(this, callDescription, project);
			
			// If we hit the end of the string (no more new lines), we're done. Otherwise update to the next line.
			if (nextLineStart == -1)
				break;
			else
				index = nextLineStart;
		}		
		
		ofy().save().entity(this).now();
	}	
	
	public void reuseSearchCompleted(ReusedFunctionDTO dto, String callDescription, Project project)
	{
		if (dto.noFunction)
		{
			// Create a new function for this call, spawning microtasks to create it.
			Function callee = new Function(callDescription, project);
			
			// Create a microtask to add the call
			// TODO: this should not be created until AFTER building the function is completed
			WriteCall writeCall = new WriteCall(this, callee, project);
		}
		else
		{	
			// lookup the function by name
			Function callee = ofy().load().type(Function.class).filter("name", dto.functionName).first().get();
			
			// Create a microtask to add the call
			WriteCall writeCall = new WriteCall(this, callee, project);
		}
	}
	
	public void writeDescriptionCompleted(String name, String description, String returnType, 
	List<ParameterDTO> params, Project project)
	{
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
	
	public void writeCallCompleted(FunctionDTO dto, Project project)
	{
		this.code = dto.code;
		ofy().save().entity(this).now();
	}
	
	public void unitTestCorrectionCompleted(FunctionDTO dto, Project project)
	{
		this.code = dto.code;
		if(dto.testCaseNumber != null)
		{
			// creates a disputed test case
			tests.get(Integer.parseInt(dto.testCaseNumber)).get().disputeUnitTestCorrectionCreated(dto, project);	
		}
		// all unit tests are closed, we only generate one at a time
		for(Ref<Test> testCases: tests)
		{
			testCases.get().closeUnitTest();
		}
		// generate the next Unittest microtask, debug microtask
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
	
	public FunctionDescriptionDTO getDescriptionDTO()
	{
		List<ParameterDTO> paramDTOs = new ArrayList<ParameterDTO>();
		for (Parameter param : parameters)
			paramDTOs.add(param.getDTO());
		
		return new FunctionDescriptionDTO(name, returnType, paramDTOs, description);
	}
	
	public boolean anyTestCasesDisputed()
	{
		for(int i = 0; i < tests.size(); i++)
		{
			if(tests.get(i).getValue() != null)
			{
				if(tests.get(i).getValue().isDisputed())
				{
					return true;
				}
			}
		}
		return false;
	}

	public void createDisputedTestCase(FunctionDTO dto, Project project)
	{
	 tests.get(Integer.parseInt(dto.testCaseNumber)).get().disputeUnitTestCorrectionCreated(dto, project);	
	}
}
