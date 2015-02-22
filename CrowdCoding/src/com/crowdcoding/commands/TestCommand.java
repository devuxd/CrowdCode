package com.crowdcoding.commands;

import java.util.List;

import com.crowdcoding.entities.Test;
import com.crowdcoding.entities.microtasks.WriteTest;
import com.crowdcoding.servlets.CommandContext;
import com.googlecode.objectify.LoadResult;

public abstract class TestCommand extends Command
{
	protected long testID;

	public static TestCommand create(String description, long functionID, String functionName, int functionVersion)
		{ return new Create1(description, functionID, functionName, functionVersion); }

	public static TestCommand create(long functionID, String functionName, String description, List<String> inputs, String output, String code, int functionVersion, boolean readOnly)
		{ return new Create2(functionID, functionName, description, inputs, output, code , functionVersion, readOnly); }

	public static TestCommand testEdited(long testID, String newDescription, int functionVersion)
	{     return new TestEdited(testID, newDescription, functionVersion);}
	public static TestCommand dispute(long testID, String issueDescription, int functionVersion)
		{ return new Dispute(testID, issueDescription, functionVersion); }
	public static TestCommand delete(long testID) { return new Delete(testID); }
	public static TestCommand functionChangedInterface(long testID, String oldFullDescription,
			String newFullDescription, int functionVersion)
		{ return new FunctionChangedInterface(testID, oldFullDescription, newFullDescription, functionVersion); }

	public static TestCommand disputeCompleted(long testID, int functionVersion)
	{ return new DisputeCompleted(testID, functionVersion); }

	public static TestCommand functionBecomeUseless(long testID)
	{ return new FunctionBecomeUseless(testID); }

	public static TestCommand functionReturnUsefull(long testID)
	{ return new FunctionReturnUsefull(testID); }


	// All constructors for TestCommand MUST call queueCommand and the end of the constructor to add the
	// command to the queue.
	private static void queueCommand(Command command)
	{
		CommandContext.ctx.addCommand(command);
	}

	public void execute(String projectId)
	{
		if( testID != 0 ){
			LoadResult<Test> testRef = Test.find(testID);

			if (testRef == null)
				System.out.println("Cannot execute TestCommand. Could not find test for TestID " + testID);
			else
			{
				Test test =testRef.now();
				execute(test, projectId);

				// Save the associated artifact to Firebase
				test.storeToFirebase(projectId);
			}
		}
		else execute(null, projectId);
	}

	public abstract void execute(Test test, String projectId);


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

		public void execute(Test test, String projectId)
		{
			Test newTest = new Test(description, functionID, functionName, projectId, functionVersion);
			newTest.storeToFirebase(projectId);
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
		private String description;
		private boolean readOnly;

		public Create2(long functionID, String functionName, String description, List<String> inputs, String output, String code, int functionVersion, boolean readOnly)
		{
			this.testID = 0L;
			this.description = description;
			this.functionID = functionID;
			this.functionName = functionName;
			this.inputs = inputs;
			this.output = output;
			this.code = code;
			this.functionVersion = functionVersion;
			this.readOnly=readOnly;

			queueCommand(this);
		}

		public void execute(Test test, String projectId)
		{
			Test newTest = new Test(functionID, functionName, description, inputs, output, code, projectId, functionVersion, readOnly);
			newTest.storeToFirebase(projectId);
		}
	}

	protected static class DisputeCompleted extends TestCommand
	{
		private int functionVersion;
		public DisputeCompleted(long testID, int functionVersion)
		{
			this.functionVersion= functionVersion;
			queueCommand(this);

		}
		public void execute(Test test, String projectId)
		{
			test.queueMicrotask(new WriteTest(test, projectId, functionVersion), projectId);
		}

	}

	protected static class FunctionBecomeUseless extends TestCommand
	{
		public FunctionBecomeUseless(long testID)
		{
			queueCommand(this);

		}
		public void execute(Test test, String projectId)
		{
			test.setNeeded(false);
		}

	}

	protected static class FunctionReturnUsefull extends TestCommand
	{
		public FunctionReturnUsefull(long testID)
		{
			queueCommand(this);

		}
		public void execute(Test test, String projectId)
		{
			test.setNeeded(true);
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

		public void execute(Test test, String projectId)
		{
			test.dispute(issueDescription, projectId,functionVersion);
		}
	}
	protected static class TestEdited extends TestCommand
	{
		private String newDescription;
		private int functionVersion;
		public TestEdited(long testID, String newDescription, int functionVersion)
		{
			this.newDescription = newDescription;
			this.testID = testID;
			this.functionVersion = functionVersion;
			queueCommand(this);
		}

		public void execute(Test test, String projectId)
		{
				String oldDescription = test.getDescription();
				test.setDescription(newDescription);
				test.queueMicrotask(new WriteTest(projectId, test, oldDescription, functionVersion), projectId);
		}
	}
	protected static class Delete extends TestCommand
	{
		public Delete(long testID)
		{
			this.testID = testID;
			queueCommand(this);
		}

		public void execute(Test test, String projectId)
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

		public void execute(Test test, String projectId)
		{
			test.functionChangedInterface(oldFullDescription, newFullDescription, projectId, functionVersion);
		}
	}
}
