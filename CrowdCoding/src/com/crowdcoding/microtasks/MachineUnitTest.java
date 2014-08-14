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
import com.crowdcoding.artifacts.commands.FunctionCommand;
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
          postToFirebase(project, null, false);
         
          project.historyLog().beginEvent(new MicrotaskSpawned(this, null));
          project.historyLog().endEvent();
     }    
     
     public Microtask copy(Project project)
     {
    	 return new MachineUnitTest(project);
     }     

     protected void doSubmitWork(DTO dto, String workerID, Project project)
     {
          MachineUnitTestDTO dto2 = (MachineUnitTestDTO)dto;

          // The DTO contains a list of test cases that passed and a list of test cases that failed.
          // Other tests - those that call unimplemented functions - neither pass nor fail. From this,
          // we compute the set of functions that 1) passed at least one test and did not fail any
          // and 2) failed at least one test.          
          
          // Compute the set of functions that 2) failed at least one test.
          Set<Long> failed = new HashSet<Long>();
          for (Integer failingTestIndex : dto2.failingTestCases)
          {
               failed.add(testCaseList.get(failingTestIndex).getFunctionID());              
          }
         
          // Compute the set of functions that 1) passed at least one test and did not fail any
          Set<Long> passed = new HashSet<Long>();
          for (Integer passingTestIndex : dto2.passingTestCases)
          {
        	  long functionID = testCaseList.get(passingTestIndex).getFunctionID(); 
              if (!failed.contains(functionID))
            	  passed.add(functionID);        	  
          }
         
          // Notify each function if it passed or failed its tests
          for (long functionID : failed)
        	  FunctionCommand.failedTests(functionID);
          for (long functionID : passed)
        	  FunctionCommand.passedTests(functionID);
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
 		return "run unit tests";
 	 }

     public String[] getAllTestCodeInSystem()
     {
          testCaseList = ofy().load().type(Test.class).ancestor(project.getKey())
                    .filter("isImplemented", true).list();
          String [] arrayOfTestCaseCode = new String[testCaseList.size()];
          for(int i = 0; i < arrayOfTestCaseCode.length; i++)
          {
        	  String functionName = testCaseList.get(i).getFunctionName();
        	  // We need to replace every call to the function under test (functionName) in the test code with a 
        	  // call to our mock (functionNameaaaActualName). Since we don't have a parse tree here, 
        	  // we're just going to do a string replace. That is, we'll replace every occurence
        	  // of "functionName(" with with "functionNameaaaActualImp(. And also 
        	  // replace "functionName (" with "functionNameaaaActualImp (". Including the parens hopefully
        	  // avoids most (but certainly not all) situations where the function name is used in the
        	  // error description in the test case or elsewhere. 
        	  String rawTestCode = testCaseList.get(i).getTestCode();       	  
              arrayOfTestCaseCode[i] = rawTestCode.replace(functionName + "(", functionName + "aaaActualIMP(")
            		                               .replace(functionName + " (", functionName + "aaaActualIMP (");
          }
          ofy().save().entity(this).now();
          return arrayOfTestCaseCode;
     }
}