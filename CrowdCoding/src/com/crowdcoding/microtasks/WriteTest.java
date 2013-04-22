package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

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
	      test.get().editTestCompleted((FunctionDTO) dto, project);
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

	public String generateDefaultUnitTest()
	{	     
	      StringBuilder builder = new StringBuilder();
	      builder.append("equal(");
	      builder.append(getFunction().getName());
	      builder.append("(");
	      for(String paramName : getFunction().getParamNames()){
	           builder.append("<" + paramName + ">,");
	      }
	      builder.replace(builder.length()-1,builder.length(),"");
	      builder.append("), <expectedResult>, '" + test.get().getDescription() + "');");
	      return builder.toString();
	 }
}