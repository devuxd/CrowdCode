package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.List;

import com.crowdcoding.Project;
import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Test;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.history.MicrotaskSpawned;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class DebugTestFailure extends Microtask
{
     @Load private Ref<Function> function;

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
         
          project.historyLog().beginEvent(new MicrotaskSpawned(this, function));
          project.historyLog().endEvent();
     }

     protected void doSubmitWork(DTO dto, Project project)
     {
          function.get().debugTestFailureCompleted((FunctionDTO) dto, project);    
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
 		return "debugging a test failure";
 	}
}