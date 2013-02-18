package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Project;
import com.crowdcoding.artifacts.Test;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.MachineUnitTestDTO;
import com.googlecode.objectify.Ref;
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
		// if there was an error then create a new disputeUnittest means
		if(dto2.errorTestCase == -1)
		{
			return;
		}
		else
		{
			new DebugTestFailure(testCaseList.get(dto2.errorTestCase).getFunction(), project);
		}
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
