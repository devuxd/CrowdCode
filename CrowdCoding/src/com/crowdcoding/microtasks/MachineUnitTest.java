package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Project;
import com.crowdcoding.artifacts.Test;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.MachineUnitTestDTO;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class MachineUnitTest extends Microtask
{
	@Load private Project project;
	@Load private List<Test> testCaseList;

	private MachineUnitTest()
	{
	}

	public MachineUnitTest(Project project)
	{
		super(project);
		this.project = project;
		testCaseList = new ArrayList<Test>();
		ofy().save().entity(this).now();
	}

	protected void doSubmitWork(DTO dto, Project project)
	{
		MachineUnitTestDTO dto2 = (MachineUnitTestDTO)dto;

		// Compute the set of functions that failed at least one test.
		Set<Function> failed = new HashSet<Function>();
		for (Integer failingTestIndex : dto2.errorTestCase)
		{
			failed.add(testCaseList.get(failingTestIndex).getFunction());			
		}
		
		// Compute the set of functions that were tested and are not in the set of failing functions
		Set<Function> passed = new HashSet<Function>();
		for (Test test : testCaseList)
		{
			Function function = test.getFunction();
			if (!failed.contains(function))
				passed.add(function);
		}
		
		// Notify each function if it passed or failed its tests
		for (Function function : failed)
			function.failedTests(project);
		for (Function function : passed)
			function.passedTests(project);	
	}

	protected Class getDTOClass()
	{
		return MachineUnitTestDTO.class;
	}

	public String getUIURL()
	{
		return "/html/MachineUnitTest.jsp";
	}

	public String[] getAllTestCodeInSystem()
	{
		testCaseList = ofy().load().type(Test.class).ancestor(project.getKey())
				.filter("isImplemented", true).list();
		String [] arrayOfTestCaseCode = new String[testCaseList.size()];
		for(int i = 0; i < arrayOfTestCaseCode.length; i++)
		{
			arrayOfTestCaseCode[i] = testCaseList.get(i).getTestCode();
		}
		ofy().save().entity(this).now();
		return arrayOfTestCaseCode;
	}
}
