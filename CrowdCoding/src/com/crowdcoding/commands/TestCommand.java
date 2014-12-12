package com.crowdcoding.commands;

import java.util.List;

import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.Test;
import com.crowdcoding.servlets.CommandContext;
import com.googlecode.objectify.Ref;

public abstract class TestCommand extends Command
{
	protected long testID;

	public static TestCommand create(String description, long functionID, String functionName, int functionVersion)
		{ return new Create1(description, functionID, functionName, functionVersion); }
	
	public static TestCommand create(long functionID, String functionName, List<String> inputs, String output, String code, int functionVersion)
		{ return new Create2(functionID, functionName, inputs, output, code , functionVersion); }
	
	public static TestCommand create(long functionID, String functionName, String description, List<String> inputs, String output, String code, int functionVersion)
		{ return new Create3(functionID, functionName, description, inputs, output, code , functionVersion); }

	public static TestCommand dispute(long testID, String issueDescription, int functionVersion)
		{ return new Dispute(testID, issueDescription, functionVersion); }
	public static TestCommand delete(long testID) { return new Delete(testID); }
	public static TestCommand functionChangedInterface(long testID, String oldFullDescription,
			String newFullDescription, int functionVersion)
		{ return new FunctionChangedInterface(testID, oldFullDescription, newFullDescription, functionVersion); }


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


	protected static class Create1 extends TestCommand
	{
		private String description;
		private long functionID;
		private String functionName;
		private int functionVersion;

		public Create1(String description, long functionID, String functionName, int functionVersion)
		{
			this.testID = 0L;
			this.description = description;
			this.functionID = functionID;
			this.functionName = functionName;
			this.functionVersion = functionVersion;
			queueCommand(this);
		}

		// Need to override the default execute, as there is no test to load!
		public void execute(Project project)
		{
			Test test = new Test(description, functionID, functionName, project, functionVersion);
			test.storeToFirebase(project);
		}

		public void execute(Test test, Project project)
		{
			throw new RuntimeException("Error - this method should never be called!");
		}
	}

	protected static class Create2 extends TestCommand
	{
		private long functionID;
		private String functionName;
		private List<String> inputs;
		private String output;
		private String code;
		private int functionVersion;
		public Create2(long functionID, String functionName, List<String> inputs, String output, String code, int functionVersion)
		{
			this.testID = 0L;
			this.functionID = functionID;
			this.functionName = functionName;
			this.inputs = inputs;
			this.output = output;
			this.code = code;
			this.functionVersion = functionVersion;
			queueCommand(this);
		}

		// Need to override the default execute, as there is no test to load!
		public void execute(Project project)
		{
			Test test = new Test(functionID, functionName, inputs, output, code, project, functionVersion);
			test.storeToFirebase(project);
		}

		public void execute(Test test, Project project)
		{
			throw new RuntimeException("Error - this method should never be called!");
		}
	}

	protected static class Create3 extends TestCommand
	{
		private long functionID;
		private String functionName;
		private List<String> inputs;
		private String output;
		private String code;
		private int functionVersion;
		private String description;
		
		public Create3(long functionID, String functionName, String description, List<String> inputs, String output, String code, int functionVersion)
		{
			this.testID = 0L;
			this.description = description;
			this.functionID = functionID;
			this.functionName = functionName;
			this.inputs = inputs;
			this.output = output;
			this.code = code;
			this.functionVersion = functionVersion;
			
			queueCommand(this);
		}

		// Need to override the default execute, as there is no test to load!
		public void execute(Project project)
		{
			Test test = new Test(functionID, functionName, inputs, output, code, project, functionVersion);
			test.setDescription(description);
			test.storeToFirebase(project);
			
			FunctionCommand.testBecameImplemented(functionID, test.getID());		
		}

		public void execute(Test test, Project project)
		{
			throw new RuntimeException("Error - this method should never be called!");
		}
	}


	protected static class Dispute extends TestCommand
	{
		private String issueDescription;
		private int functionVersion;

		public Dispute(long testID, String issueDescription, int functionVersion)
		{
			this.functionVersion = functionVersion;
			this.testID = testID;
			this.issueDescription = issueDescription;
			queueCommand(this);
		}

		public void execute(Test test, Project project)
		{
			test.dispute(issueDescription, project,functionVersion);
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
		private int functionVersion;

		public FunctionChangedInterface(long testID, String oldFullDescription,
				String newFullDescription, int functionVersion)
		{
			this.testID = testID;
			this.oldFullDescription = oldFullDescription;
			this.newFullDescription = newFullDescription;
			this.functionVersion = functionVersion;
			queueCommand(this);
		}

		public void execute(Test test, Project project)
		{
			test.functionChangedInterface(oldFullDescription, newFullDescription, project, functionVersion);
		}
	}
}
