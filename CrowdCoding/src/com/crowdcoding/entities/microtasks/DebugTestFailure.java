package com.crowdcoding.entities.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.List;

import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.DebugDTO;
import com.crowdcoding.dto.FunctionDTO;
import com.crowdcoding.dto.firebase.DebugTestFailureInFirebase;
import com.crowdcoding.dto.firebase.MicrotaskInFirebase;
import com.crowdcoding.dto.firebase.NewsItemInFirebase;
import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.Function;
import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.Test;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.history.MicrotaskSpawned;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Subclass;
import com.googlecode.objectify.annotation.Load;
import com.googlecode.objectify.annotation.Parent;

@Subclass(index=true)
public class DebugTestFailure extends Microtask
{
	@Parent @Load private Ref<Function> function;
	@Load private Ref<Test> failedTest;
	boolean automatic = false;

	// Default constructor for deserialization
	private DebugTestFailure()
	{
	}

	// Constructor for initial construction.
	public DebugTestFailure(Function function, String projectId)
	{
		super(projectId);
		this.submitValue = 15;

		this.function = (Ref<Function>) Ref.create(function.getKey());
		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(
				new DebugTestFailureInFirebase(
						id,
						this.microtaskTitle(),
						this.microtaskName(),
						function.getName(),
						function.getID(),
						false,
						false,
						submitValue,
						function.getID()),
				Microtask.keyToString(this.getKey()),
				projectId);

		HistoryLog.Init(projectId).addEvent(new MicrotaskSpawned(this));
	}

	// Constructor for initial construction.
	public DebugTestFailure(Function function, Test test, String projectId)
	{

		super(projectId);
		this.submitValue = 15;

		this.function   = (Ref<Function>) Ref.create(function.getKey());
		this.failedTest = (Ref<Test>) Ref.create(test.getKey());
		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskCreated(new DebugTestFailureInFirebase(
				id,
				this.microtaskTitle(),
				this.microtaskName(),
				function.getName(),
				function.getID(),
				false,
				false,
				submitValue,
				test.getID(),
				function.getID()),
				Microtask.keyToString(this.getKey()),
				projectId);

		HistoryLog.Init(projectId).addEvent(new MicrotaskSpawned(this));
	}

	public Microtask copy(String projectId)
	{
		return new DebugTestFailure(  (Function) getOwningArtifact(), projectId);
	}


	public Key<Microtask> getKey()
	{
		return Key.create( function.getKey(), Microtask.class, this.id );
	}

	protected void doSubmitWork( DTO dto, String workerID, String projectId)
	{	
		System.out.println("--> DEBUG TEST FAILURE: submitting microtask");
		System.out.println(dto);
		
		DebugDTO debugDTO = (DebugDTO) dto;
		
		
		function.get().debugTestFailureCompleted( debugDTO , projectId);
		FirebaseService.postToNewsfeed(workerID, (
	    		new NewsItemInFirebase(
	    			this.submitValue,
	    			this.submitValue,
	    			this.microtaskName(),
	    			"SubmittedDebugTestFailure",
	    			Microtask.keyToString(this.getKey()),
	    			-1 // differentiate the reviews from the 0 score tasks
				).json()),
				Microtask.keyToString(this.getKey()),
				projectId
	    );

		
		if( debugDTO.autoSubmit != null && debugDTO.autoSubmit != true ){
			WorkerCommand.increaseStat(workerID, "debugs",1);
		}
	}

	protected Class getDTOClass()
	{
		return FunctionDTO.class;
	}

	public Artifact getOwningArtifact()
	{
		Artifact owning;
		try {
			return function.safe();
		} catch ( Exception e ){
			ofy().load().ref(this.function);
			return function.get();
		}
	}

	public String getUIURL()
	{
		return "/html/microtasks/debugTestFailure.jsp";
	}

	public String getFunctionCode()
	{
		return function.getValue().getEscapedCode();
	}

	public String[] getTestCases(String projectId)
	{
		List<Ref<Test>> tempCases = function.getValue().getTestCases(projectId);
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

	public String[] getTestDescriptions(String projectId)
	{
		List<Ref<Test>> tempCases = function.getValue().getTestCases(projectId);
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