package com.crowdcoding.commands;

import java.util.List;

import javax.print.attribute.standard.Sides;

import com.crowdcoding.dto.PseudoFunctionDTO;
import com.crowdcoding.dto.TestDescriptionDTO;
import com.crowdcoding.entities.Function;
import com.crowdcoding.entities.Test;
import com.crowdcoding.servlets.CommandContext;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.LoadResult;

public abstract class FunctionCommand extends Command {
	protected long functionID;

	public static FunctionCommand create(String name, String returnType,
			List<String> paramNames, List<String> paramTypes,
			List<String> paramDescriptions, String header, String description,
			String code, List<TestDescriptionDTO> tests, boolean readOnly) {
		return new Create(name, returnType, paramNames, paramTypes,
				paramDescriptions, header, description, code, tests, readOnly);
	}

	public static FunctionCommand removeCaller(long functionID,
			long callerFunctionID) {
		return new RemoveCaller(functionID, callerFunctionID);
	}

	public static FunctionCommand addCaller(long functionID,
			long callerFunctionID) {
		return new AddCaller(functionID, callerFunctionID);
	}

	public static FunctionCommand addDependency(long functionID,
			long newDependency, String pseudoFunctionName, String pseudoFunctionDescription) {
		return new AddDependency(functionID, newDependency, pseudoFunctionName, pseudoFunctionDescription);
	}

	public static FunctionCommand addTest(long functionID, long testID, String testDescription) {
		return new AddTest(functionID, testID, testDescription);
	}

	public static FunctionCommand writeTestJobQueue(long functionID) {
		return new WriteTestJobQueue(functionID);
	}

	public static FunctionCommand testBecameImplemented(long functionID,
			long testID) {
		return new TestBecameImplemented(functionID, testID);
	}

	public static FunctionCommand passedTests(long functionID) {
		return new PassedTests(functionID);
	}

	public static FunctionCommand failedTests(long functionID) {
		return new FailedTests(functionID);
	}

	public static FunctionCommand calleeChangedInterface(long functionID,
			String oldFullDescription, String newFullDescription) {
		return new CalleeChangedInterface(functionID, oldFullDescription,
				newFullDescription);
	}

	public static FunctionCommand calleeBecameDescribed(long functionID,
			long calleeId, String pseudoFunctionName) {
		return new CalleeBecameDescribed(functionID, calleeId,
				pseudoFunctionName);
	}

	public static FunctionCommand calleeBecomeUseless(long functionID,
			long calleeId, String disputeText) {
		return new CalleeBecomeUseless(functionID, calleeId, disputeText);
	}

	public static FunctionCommand disputeTestCases(long functionID,
			String issueDescription, String testDescription, long artifactId) {
		return new DisputeTestCases(functionID, issueDescription,
				testDescription, artifactId);
	}

	public static FunctionCommand disputeFunctionSignature(long functionID,
			String issueDescription, long artifactId) {
		return new DisputeFunctionSignature(functionID, issueDescription, artifactId);
	}

	private FunctionCommand(Long functionID) {
		this.functionID = functionID;
		queueCommand(this);
	}

	// All constructors for FunctionCommand MUST call queueCommand by calling
	// the super constructor
	private static void queueCommand(Command command) {
		CommandContext.ctx.addCommand(command);
	}


	public void execute(String projectId) {
		if (functionID != 0) {
			LoadResult<Function> function = Function.find(functionID);
			if (function == null)
				System.out
						.println("Cannot execute FunctionCommand. Could not find the function for FunctionID "
								+ functionID);
			else {
				execute(function.now(), projectId);

				// Save the associated artifact to Firebase
				function.now().storeToFirebase(projectId);
			}
		} else
			execute(null, projectId);

	}

	public abstract void execute(Function function, String projectId);

	protected static class Create extends FunctionCommand {
		private String name;
		private String returnType;
		private List<String> paramNames;
		private List<String> paramTypes;
		private List<String> paramDescriptions;
		private String header;
		private String description;
		private String code;
		private boolean readOnly;
		private List<TestDescriptionDTO> tests;

		public Create(String name, String returnType, List<String> paramNames,
				List<String> paramTypes, List<String> paramDescriptions,
				String header, String description, String code,
				List<TestDescriptionDTO> tests, boolean readOnly) {
			super(0L);
			this.name = name;
			this.returnType = returnType;
			this.paramNames = paramNames;
			this.paramTypes = paramTypes;
			this.paramDescriptions = paramDescriptions;
			this.header = header;
			this.description = description;
			this.code = code;
			this.tests = tests;
			this.readOnly = readOnly;
		}

		// Override the default execute behavior, as there is no function yet to
		// be loaded.
		public void execute(Function function, String projectId) {

			System.out.println("Creating function  "+this.name);
			Function newFunction = new Function(name, returnType, paramNames,
					paramTypes, paramDescriptions, header, description, code,
					readOnly, projectId);
			newFunction.storeToFirebase(projectId);
			newFunction.createTest(tests);
		}
	}

	protected static class RemoveCaller extends FunctionCommand {
		private long callerFunctionID;

		public RemoveCaller(long functionID, long callerFunctionID) {
			super(functionID);
			this.callerFunctionID = callerFunctionID;
		}

		public void execute(Function function, String projectId) {
			LoadResult<Function> callerFunction = Function.find(callerFunctionID);
			if (callerFunction == null)
				System.out
						.println("Cannot execute FunctionCommand. Could not find the caller function "
								+ "for FunctionID " + callerFunctionID);
			else
				function.removeCaller(callerFunction.now());
		}
	}

	protected static class AddCaller extends FunctionCommand {
		private long callerFunctionID;

		public AddCaller(long functionID, long callerFunctionID) {
			super(functionID);
			this.callerFunctionID = callerFunctionID;
		}

		public void execute(Function function, String projectId)
		{
			LoadResult<Function> callerFunction = Function.find(callerFunctionID);
			if (callerFunction == null)
				System.out
						.println("Cannot execute FunctionCommand. Could not find the caller function "
								+ "for FunctionID " + callerFunctionID);
			else
				function.addCaller(callerFunction.now());
		}
	}

	protected static class TestBecameImplemented extends FunctionCommand {
		private long testID;

		public TestBecameImplemented(long functionID, long testID) {
			super(functionID);
			this.testID = testID;
		}

		public void execute(Function function, String projectId) {

			LoadResult<Test> test = Test.find(testID);
			if (test == null)
				System.out
						.println("Cannot execute FunctionCommand. Could not find the test "
								+ "for TestID " + testID);
			else
				function.testBecameImplemented(test.now());
		}
	}

	protected static class PassedTests extends FunctionCommand {
		public PassedTests(long functionID) {
			super(functionID);
		}

		public void execute(Function function, String projectId) {
			function.passedTests(projectId);
		}
	}

	protected static class FailedTests extends FunctionCommand {
		public FailedTests(long functionID) {
			super(functionID);
		}

		public void execute(Function function, String projectId) {
			function.failedTests(projectId);
		}
	}

	protected static class CalleeChangedInterface extends FunctionCommand {
		private String oldFullDescription;
		private String newFullDescription;

		public CalleeChangedInterface(long functionID,
				String oldFullDescription, String newFullDescription) {
			super(functionID);
			this.oldFullDescription = oldFullDescription;
			this.newFullDescription = newFullDescription;
		}

		public void execute(Function function, String projectId) {
			function.calleeChangedInterface(oldFullDescription,
					newFullDescription, projectId);
		}
	}

	protected static class AddDependency extends FunctionCommand {

		private String pseudoFunctionName;
		private String pseudoFunctionDescription;
		private long newDependency;

		public AddDependency(long functionID, long newDependency,
				String pseudoFunctionName, String pseudoFunctionDescription) {
			super(functionID);
			this.pseudoFunctionName = pseudoFunctionName;
			this.pseudoFunctionDescription = pseudoFunctionDescription;
			this.newDependency = newDependency;
		}

		public void execute(Function function, String projectId) {
			function.addDependency(newDependency, pseudoFunctionName, pseudoFunctionDescription);
		}
	}

	protected static class AddTest extends FunctionCommand {
		private long testID;
		private String testDescripiton;

		public AddTest(long functionID, long testID, String testDescripiton) {
			super(functionID);
			this.testID = testID;
			this.testDescripiton = testDescripiton;
		}

		public void execute(Function function, String projectId) {
			function.addTest(testID, testDescripiton);
		}
	}

	protected static class WriteTestJobQueue extends FunctionCommand {
		private long functionID;

		public WriteTestJobQueue(long functionID) {
			super(functionID);
			this.functionID = functionID;
		}

		public void execute(Function function, String projectId) {
			FirebaseService.writeTestJobQueue(functionID, projectId);
		}
	}

	protected static class CalleeBecameDescribed extends FunctionCommand {

		private long calleeId;
		private String pseudoFunctionName;

		public CalleeBecameDescribed(long functionID, long calleeId,
				String pseudoFunctionName) {
			super(functionID);
			this.calleeId = calleeId;
			this.pseudoFunctionName = pseudoFunctionName;
		}

		public void execute(Function function, String projectId) {
			function.calleeBecameDescribed(calleeId, pseudoFunctionName, projectId);
		}
	}

	protected static class CalleeBecomeUseless extends FunctionCommand {
		private long calleeId;
		private String disputeText;

		public CalleeBecomeUseless(long functionID, long calleeId,
				String disputeText) {
			super(functionID);
			this.calleeId = calleeId;
			this.disputeText = disputeText;
		}

		public void execute(Function function, String projectId) {
			function.calleeBecomeUseless(calleeId, disputeText, projectId);
		}
	}

	protected static class DisputeTestCases extends FunctionCommand {
		private String issueDescription;
		private String testDescription;
		private long artifactId;


		public DisputeTestCases(long functionID, String issueDescription,
				String testDescription, long artifactId) {
			super(functionID);
			this.issueDescription = issueDescription;
			this.testDescription = testDescription;
			this.artifactId = artifactId;

		}

		public void execute(Function function, String projectId) {
			function.disputeTestCases(issueDescription, testDescription, artifactId,
					projectId);
		}
	}

	protected static class DisputeFunctionSignature extends FunctionCommand {
		private String issueDescription;
		private long artifactId;

		public DisputeFunctionSignature(long functionID, String issueDescription, long artifactId) {
			super(functionID);
			this.issueDescription = issueDescription;
			this.artifactId = artifactId;
		}

		public void execute(Function function, String projectId) {
			function.disputeFunctionSignature(issueDescription, artifactId, projectId);
		}
	}
}
