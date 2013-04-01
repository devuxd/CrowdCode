package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;
import com.crowdcoding.artifacts.Parameter;

import java.io.IOException;

import com.crowdcoding.Project;
import com.crowdcoding.Worker;
import com.crowdcoding.artifacts.Artifact;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Test;
import com.crowdcoding.dto.EntrypointDTO;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.history.MicrotaskSpawned;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class WriteTest extends Microtask
{
     @Load private Ref<Test> test;
    
     // Default constructor for deserialization
     private WriteTest()
     {         
     }
    
     // Constructor for initial construction
     public WriteTest(Test test, Project project)
     {
          super(project);
          this.test = (Ref<Test>) Ref.create(test.getKey());         
          ofy().save().entity(this).now();
         
          project.historyLog().beginEvent(new MicrotaskSpawned(this, test));
          project.historyLog().endEvent();
     }

     protected void doSubmitWork(DTO dto, Project project)
     {
          test.get().writeTestCompleted((FunctionDTO) dto, project);
     }
    
     protected Class getDTOClass()
     {
          return FunctionDTO.class;
     }    
         
     public String getUIURL()
     {
          return "/html/writeTest.jsp";
     }
    
     public Function getFunction()
     {
          return test.getValue().getFunction();
     }
    
     public Artifact getOwningArtifact()
     {
          return getFunction();
     }
    
     public String getDescription()
     {
          return test.getValue().getDescription();
     }
    
     public String microtaskTitle()
     {
          return "Write a test";
     }
     
 	 public String microtaskDescription()
 	 {
 		  return "writing a test";
 	 }
    
    public String generateDefaultUnitTest(){
         
          StringBuilder builder = new StringBuilder();
          builder.append("equal(");
          builder.append(getFunction().getName());
          builder.append("(");
          for(Parameter param: getFunction().getParameters()){
               builder.append("<");
               builder.append(param.getName());
               builder.append(">,");
          }
          builder.replace(builder.length()-1,builder.length(),"");
          builder.append("), <expectedResult>, <'Message to report if this test fails'>);");
          return builder.toString();
     }
}