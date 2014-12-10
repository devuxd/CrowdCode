package com.crowdcoding.commands;

import java.util.List;

import sun.reflect.generics.reflectiveObjects.NotImplementedException;

import com.crowdcoding.entities.Function;
import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.Test;
import com.crowdcoding.servlets.CommandContext;
import com.googlecode.objectify.Ref;

public abstract class FunctionCommand extends Command
{
	protected long functionID;

	public static FunctionCommand create(String name, String returnType, List<String> paramNames,
			List<String> paramTypes, List<String> paramDescriptions, String header, String description, String code)
		{ return new Create(name, returnType, paramNames, paramTypes, paramDescriptions, header, description, code); }

	public static FunctionCommand removeCaller(long functionID, long callerFunctionID)
		{ return new RemoveCaller(functionID, callerFunctionID); }
	public static FunctionCommand addCaller(long functionID, long callerFunctionID)
		{ return new AddCaller(functionID, callerFunctionID); }
	public static FunctionCommand addDependency(long functionID, long newDependency, String pseudoCall)
		{ return new AddDependency(functionID, newDependency, pseudoCall); }
	public static FunctionCommand addTest(long functionID, long testID)
		{ return new AddTest(functionID, testID); }

	public static FunctionCommand testBecameImplemented(long functionID, long testID)
		{ return new TestBecameImplemented(functionID, testID); }
	public static FunctionCommand passedTests(long functionID)
		{ return new PassedTests(functionID); }
	public static FunctionCommand failedTests(long functionID)
		{ return new FailedTests(functionID); }
	public static FunctionCommand failedTest(long functionID,long testID)
	{ return new FailedTest(functionID,testID); }
	public static FunctionCommand calleeChangedInterface(long functionID, String oldFullDescription,
			String newFullDescription)
		{ return new CalleeChangedInterface(functionID, oldFullDescription, newFullDescription); }
	public static FunctionCommand calleeBecameDescribed(long functionID, String calleeFullDescription,
			String pseudoCall)
		{ return new CalleeBecameDescribed(functionID, calleeFullDescription, pseudoCall); }
	public static FunctionCommand disputeTestCases(long functionID, String issueDescription,
			String testDescription)
		{ return new DisputeTestCases(functionID, issueDescription, testDescription); }
	public static FunctionCommand disputeFunctionSignature(long functionID, String issueDescription)
		{ return new DisputeFunctionSignature(functionID, issueDescription); }

	private FunctionCommand(long functionID)
	{
		this.functionID = functionID;
		queueCommand(this);
	}

	// All constructors for FunctionCommand MUST call queueCommand by calling the super constructor
	private static void queueCommand(Command command)
	{
		CommandContext.ctx.addCommand(command);
	}

	public void execute(Project project)
	{
		Ref<Function> function = Function.find(functionID, project);
		if (function == null)
			System.out.println("Cannot execute FunctionCommand. Could not find the function for FunctionID " + functionID);
		else
		{
			execute(function.get(), project);

			// Save the associated artifact to Firebase
			function.get().storeToFirebase(project);
		}
	}

	public abstract void execute(Function function, Project project);

	protected static class Create extends FunctionCommand
	{
		private String name;
		private String returnType;
		private List<String> paramNames;
		private List<String> paramTypes;
		private List<String> paramDescriptions;
		private String header;
		private String description;
		private String code;

		public Create(String name, String returnType, List<String> paramNames,
				List<String> paramTypes,List<String> paramDescriptions,  String header, String description, String code)
		{
			super(0);
			this.name = name;
			this.returnType = returnType;
			this.paramNames = paramNames;
			this.paramTypes = paramTypes;
			this.paramDescriptions = paramDescriptions;
			this.header = header;
			this.description = description;
			this.code = code;
		}

		// Override the default execute behavior, as there is no function yet to be loaded.
		public void execute(Project project)
		{
			Function newFunction = new Function(name, returnType, paramNames, paramTypes, paramDescriptions, header, description,
					code, project);
			newFunction.storeToFirebase(project);
		}

		public void execute(Function function, Project project)
		{
			throw new RuntimeException("Should not call this method on Create!");
		}
	}

	protected static class RemoveCaller extends FunctionCommand
	{
		private long callerFunctionID;

		public RemoveCaller(long functionID, long callerFunctionID)
		{
			super(functionID);
			this.callerFunctionID = callerFunctionID;
		}

		public void execute(Function function, Project project)
		{
			Ref<Function> callerFunction = Function.find(callerFunctionID, project);
			if (callerFunction == null)
				System.out.println("Cannot execute FunctionCommand. Could not find the caller function "
						+ "for FunctionID " + callerFunctionID);
			else
				function.removeCaller(callerFunction.get());
		}
	}

	protected static class AddCaller extends FunctionCommand
	{
		private long callerFunctionID;

		public AddCaller(long functionID, long callerFunctionID)
		{
			super(functionID);
			this.callerFunctionID = callerFunctionID;
		}

		public void execute(Function function, Project project)
		{
			Ref<Function> callerFunction = Function.find(callerFunctionID, project);
			System.out.println("=============addddddding caller======="+callerFunction.get().getName());

			if (callerFunction == null)
				System.out.println("Cannot execute FunctionCommand. Could not find the caller function "
						+ "for FunctionID " + callerFunctionID);
			else
				function.addCaller(callerFunction.get());
		}
	}

	protected static class TestBecameImplemented extends FunctionCommand
	{
		private long testID;

		public TestBecameImplemented(long functionID, long testID)
		{
			super(functionID);
			this.testID = testID;
		}

		public void execute(Function function, Project project)
		{
			Ref<Test> test = Test.find(testID, project);
			if (test == null)
				System.out.println("Cannot execute FunctionCommand. Could not find the test "
						+ "for TestID " + testID);
			else
				function.testBecameImplemented(test.get(), project);
		}
	}

	protected static class PassedTests extends FunctionCommand
	{
		public PassedTests(long functionID)
		{
			super(functionID);
		}

		public void execute(Function function, Project project)
		{
			function.passedTests(project);
		}
	}

	protected static class FailedTests extends FunctionCommand
	{
		public FailedTests(long functionID)
		{
			super(functionID);
		}

		public void execute(Function function, Project project)
		{
			function.failedTests(project);
		}
	}

	protected static class FailedTest extends FunctionCommand
	{
		private long testID;
		public FailedTest(long functionID,long testID)
		{
			super(functionID);
			this.testID = testID;
		}

		public void execute(Function function, Project project)
		{
			Ref<Test> test = Test.find(testID, project);
			if (test == null)
				System.out.println("Cannot execute FunctionCommand. Could not find the test "
						+ "for TestID " + testID);
			else
				function.failedTest(test.get(),project);
		}
	}

	protected static class CalleeChangedInterface extends FunctionCommand
	{
		private String oldFullDescription;
		private String newFullDescription;

		public CalleeChangedInterface(long functionID, String oldFullDescription,
				String newFullDescription)
		{
			super(functionID);
			this.oldFullDescription = oldFullDescription;
			this.newFullDescription = newFullDescription;
		}

		public void execute(Function function, Project project)
		{
			function.calleeChangedInterface(oldFullDescription, newFullDescription, project);
		}
	}

	protected static class AddDependency extends FunctionCommand
	{
		private String pseudoCall;
		private long newDependency;

		public AddDependency(long functionID, long newDependency, String pseudoCall)
		{
			super(functionID);
			this.pseudoCall = pseudoCall;
			this.newDependency = newDependency;
		}

		public void execute(Function function, Project project)
		{
			function.addDependency(newDependency, pseudoCall, project);
		}
	}

	protected static class AddTest extends FunctionCommand
	{
		private long testID;

		public AddTest(long functionID, long testID)
		{
			super(functionID);
			this.testID = testID;
		}

		public void execute(Function function, Project project)
		{
			function.addTest(testID);
		}
	}

	protected static class CalleeBecameDescribed extends FunctionCommand
	{
		private String calleeFullDescription;
		private String pseudoCall;

		public CalleeBecameDescribed(long functionID, String calleeFullDescription, String pseudoCall)
		{
			super(functionID);
			this.calleeFullDescription = calleeFullDescription;
			this.pseudoCall = pseudoCall;
		}

		public void execute(Function function, Project project)
		{
			function.calleeBecameDescribed(calleeFullDescription, pseudoCall, project);
		}
	}

	protected static class DisputeTestCases extends FunctionCommand
	{
		private String issueDescription;
		private String testDescription;

		public DisputeTestCases(long functionID, String issueDescription, String testDescription)
		{
			super(functionID);
			this.issueDescription = issueDescription;
			this.testDescription = testDescription;
		}

		public void execute(Function function, Project project)
		{
			function.disputeTestCases(issueDescription, testDescription, project);
		}
	}

	protected static class DisputeFunctionSignature extends FunctionCommand
	{
		private String issueDescription;

		public DisputeFunctionSignature(long functionID, String issueDescription)
		{
			super(functionID);
			this.issueDescription = issueDescription;
		}

		public void execute(Function function, Project project)
		{
			function.DisputeFunctionSignature(issueDescription, project);
		}
	}
}
