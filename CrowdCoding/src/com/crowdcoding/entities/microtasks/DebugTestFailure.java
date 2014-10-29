package com.crowdcoding.entities.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.List;

import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.firebase.DebugTestFailureInFirebase;
import com.crowdcoding.dto.firebase.MicrotaskInFirebase;
import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.Function;
import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.Test;
import com.crowdcoding.history.MicrotaskSpawned;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class DebugTestFailure extends Microtask
{
     @Load private Ref<Function> function;
     @Load private Ref<Test> failedTest;

     // Default constructor for deserialization
     private DebugTestFailure()
     {                   
     }

     // Constructor for initial construction.
     public DebugTestFailure(Function function, Project project)
     {
          super(project);
          this.function = (Ref<Function>) Ref.create(function.getKey());         
          ofy().save().entity(this).now();
  		  FirebaseService.writeMicrotaskCreated(new DebugTestFailureInFirebase(
  				  id, 
  				  this.microtaskName(), 
  				  function.getName(), 
				  false, 
				  submitValue,
				  function.getID()), 
		id, project);
          
          project.historyLog().beginEvent(new MicrotaskSpawned(this, function));
          project.historyLog().endEvent();
     }
     
     // Constructor for initial construction.
     public DebugTestFailure(Function function, Test test, Project project)
     {
          super(project);
          this.function = (Ref<Function>) Ref.create(function.getKey());    
          this.failedTest = (Ref<Test>) Ref.create(test.getKey());          
          ofy().save().entity(this).now();
  		  FirebaseService.writeMicrotaskCreated(new DebugTestFailureInFirebase(
  				  id, 
  				  this.microtaskName(), 
  				  function.getName(), 
				  false, 
				  submitValue,
				  test.getID(),
				  function.getID()), 
		  id, project);
          
          project.historyLog().beginEvent(new MicrotaskSpawned(this, function));
          project.historyLog().endEvent();
     }
     
     public Microtask copy(Project project)
     {
    	 return new DebugTestFailure(this.function.getValue(), project);
     }
     
     protected void doSubmitWork(DTO dto, String workerID, Project project)
     {
    	function.get().debugTestFailureCompleted((FunctionDTO) dto, project);
  		// increase the stats counter 
  		WorkerCommand.increaseStat(workerID, "debugs",1);    
     }

     protected Class getDTOClass()
     {
          return FunctionDTO.class;
     }
    
     public Artifact getOwningArtifact()
     {
          return function.get();
     }

     public String getUIURL()
     {
          return "/html/microtasks/debugTestFailure.jsp";
     }

     public String getFunctionCode()
     {
          return function.getValue().getEscapedCode();
     }
    
     public String[] getTestCases(Project project)
     {
          List<Ref<Test>> tempCases = function.getValue().getTestCases(project);
          String [] stringVersion = new String[tempCases.size()];
          int i = 0;
          for(Ref<Test>  testRef : tempCases)
          {
               if(testRef != null)
               {
            	   Test test = Test.load(testRef);
                   if(test != null)
                   {
                	   if(test.getTestCode() != null)
                       {
                		   	stringVersion[i] = test.getTestCode();
                       }
                	   i++;
                    }
               }
          }
          return stringVersion;
     }
    
     public String[] getTestDescriptions(Project project)
     {
          List<Ref<Test>> tempCases = function.getValue().getTestCases(project);
          String [] stringVersion = new String[tempCases.size()];
          int i = 0;
          for(Ref<Test>  testRef : tempCases)
          {
               if(testRef != null)
               {
            	   Test test = Test.load(testRef);
                   if(test != null)
                   {
                	   if(test.getTestCode() != null)
                       {
                           stringVersion[i] = test.getDescription();
                       }
                	   i++;
                    }
               }
          }
          
          return stringVersion;
     }
    
     public String getFunctionHeaderAssociatedWithTestCase()
     {
          return function.getValue().getHeader();
     }
    
     public Function getFunction()
     {
          return function.getValue();
     }
    
     public String microtaskTitle()
     {
          return "Debug a test failure";
     }
     
 	public String microtaskDescription()
 	{
 		return "debug a test failure";
 	}
}