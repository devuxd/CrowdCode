package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.crowdcoding.Project;
import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Test;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.MachineUnitTestDTO;
import com.crowdcoding.dto.history.MicrotaskSpawned;
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
         
          project.historyLog().beginEvent(new MicrotaskSpawned(this, null));
          project.historyLog().endEvent();
     }
     
  	public void onAssign(Project project) 
  	{
  		project.testsAboutToRun();
  	}

     protected void doSubmitWork(DTO dto, Project project)
     {
          MachineUnitTestDTO dto2 = (MachineUnitTestDTO)dto;

          // The DTO contains a list of test cases that passed and a list of test cases that failed.
          // Other tests - those that call unimplemented functions - neither pass nor fail. From this,
          // we compute the set of functions that 1) passed at least one test and did not fail any
          // and 2) failed at least one test.          
          
          // Compute the set of functions that 2) failed at least one test.
          Set<Function> failed = new HashSet<Function>();
          for (Integer failingTestIndex : dto2.failingTestCases)
          {
               failed.add(testCaseList.get(failingTestIndex).getFunction());              
          }
         
          // Compute the set of functions that 1) passed at least one test and did not fail any
          Set<Function> passed = new HashSet<Function>();
          for (Integer passingTestIndex : dto2.passingTestCases)
          {
        	  Function function = testCaseList.get(passingTestIndex).getFunction(); 
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
    
     public Artifact getOwningArtifact()
     {
          // Since multiple artifacts may be affected (every test run), there is no single owning artifact.
          return null;
     }
    
     public String microtaskTitle()
     {
          return "Run unit tests";
     }
     
 	 public String microtaskDescription()
 	 {
 		return "running unit tests";
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