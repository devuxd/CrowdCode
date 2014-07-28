package com.crowdcoding.artifacts.commands;

import com.crowdcoding.Project;
import com.crowdcoding.artifacts.Test;
import com.crowdcoding.servlets.CommandContext;
import com.googlecode.objectify.Ref;

public abstract class TestCommand extends Command
{
	protected long testID;
	
	public static TestCommand dispute(long testID, String issueDescription) 
		{ return new Dispute(testID, issueDescription); }
	public static TestCommand delete(long testID) { return new Delete(testID); }
	public static TestCommand functionChangedInterface(long testID, String oldFullDescription, 
			String newFullDescription) 
		{ return new FunctionChangedInterface(testID, oldFullDescription, newFullDescription); }
	
	
	// All constructors for TestCommand MUST call queueCommand and the end of the constructor to add the
	// command to the queue.
	private static void queueCommand(Command command)
	{
		CommandContext.ctx.addCommand(command);
	}
	
	public void execute(Project project)
	{
		Ref<Test> test = Test.find(testID, project);
		if (test == null)		
			System.out.println("Cannot execute TestCommand. Could not find test for TestID " + testID);		
		else
		{
			execute(test.get(), project);
		
			// Save the associated artifact to Firebase
			test.get().storeToFirebase(project);
		}
	}

	public abstract void execute(Test test, Project project);
	
	
	protected static class Dispute extends TestCommand
	{
		private String issueDescription;
		
		public Dispute(long testID, String issueDescription)
		{
			this.testID = testID;
			this.issueDescription = issueDescription;
			queueCommand(this);
		}
		
		public void execute(Test test, Project project)
		{
			test.dispute(issueDescription, project);
		}		
	}
	
	protected static class Delete extends TestCommand
	{
		public Delete(long testID)
		{
			this.testID = testID;
			queueCommand(this);
		}
		
		public void execute(Test test, Project project)
		{
			test.delete();
		}		
	}	
	
	protected static class FunctionChangedInterface extends TestCommand
	{
		private String oldFullDescription;
		private String newFullDescription;
		
		public FunctionChangedInterface(long testID, String oldFullDescription, 
				String newFullDescription)
		{
			this.testID = testID;
			this.oldFullDescription = oldFullDescription;
			this.newFullDescription = newFullDescription;
			queueCommand(this);
		}
		
		public void execute(Test test, Project project)
		{
			test.functionChangedInterface(oldFullDescription, newFullDescription, project);
		}		
	}	
}
