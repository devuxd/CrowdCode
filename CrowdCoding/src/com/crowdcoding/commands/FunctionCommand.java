package com.crowdcoding.commands;


import java.util.List;
import com.crowdcoding.dto.CRFunctionDTO;
import com.crowdcoding.dto.ajax.microtask.submission.FunctionParameterDTO;
import com.crowdcoding.dto.ajax.microtask.submission.StubDTO;
import com.crowdcoding.entities.artifacts.Function;
import com.crowdcoding.servlets.ThreadContext;

public abstract class FunctionCommand extends Command {
	protected long functionId;

	public static FunctionCommand addClientRequestsArtifacts(CRFunctionDTO CRFunctionDTO) {
		return new AddClientRequestsArtifacts(CRFunctionDTO);
	}

	public static FunctionCommand create(String name, String returnType,
			List<FunctionParameterDTO> parameters, String header, String description,
			String code, boolean isApiArtifact, boolean isReadOnly) {
		return new Create(name, returnType, parameters, header, description, code, isApiArtifact, isReadOnly);
	}

	public static FunctionCommand removeCaller(long functionId,
			long callerFunctionID) {
		return new RemoveCaller(functionId, callerFunctionID);
	}

	public static FunctionCommand addCaller(long functionId,
			long callerFunctionID) {
		return new AddCaller(functionId, callerFunctionID);
	}

	public static FunctionCommand runTests(long functionId) {
		return new RunTests(functionId);
	}

	public static FunctionCommand submittedTestResult(long functionId, String jsonDTO){
		return new SubmittedTestResult(functionId, jsonDTO);
	}


	public static FunctionCommand calleeChangedInterface(long functionId,
			long calleeId, int oldCalleeVersion) {
		return new CalleeChangedInterface(functionId, calleeId,
				oldCalleeVersion);
	}

	public static FunctionCommand calleeBecomeDeactivated(long functionId,
			long calleeId, String disputeText) {
		return new CalleeBecomeDeactivated(functionId, calleeId, disputeText);
	}


	public static FunctionCommand disputeFunctionSignature(long functionId,
			String issueDescription, long artifactId) {
		return new DisputeFunctionSignature(functionId, issueDescription, artifactId);
	}

	public static FunctionCommand addTest(long functionId, long testId) {
		return new AddTest(functionId, testId);
	}

	public static FunctionCommand addStub(long functionId, long stubId) {
		return new AddTest(functionId, stubId);
	}

	public static FunctionCommand incrementTestSuite(long functionId) {
		return new IncrementTestSuite(functionId);
	}

	private FunctionCommand(Long functionId) {
		this.functionId = functionId;
		queueCommand(this);
	}

	// All constructors for FunctionCommand MUST call queueCommand by calling
	// the super constructor
	private static void queueCommand(Command command) {
		ThreadContext threadContext = ThreadContext.get();
        threadContext.addCommand(command);
	}


	public void execute(final String projectId) {
	        	if (functionId != 0) {
	    			Function function = Function.find(functionId);
	    			if (function == null)
	    				System.out
	    						.println("Error Cannot execute FunctionCommand. Could not find the function for FunctionID "
	    								+ functionId);
	    			else {
	    				execute(function, projectId);
	    			}
	    		} else
	    			execute(null, projectId);
	}

	public abstract void execute(Function function, String projectId);

	protected static class AddClientRequestsArtifacts extends FunctionCommand {
		private CRFunctionDTO CRFunctionDTO;

		public AddClientRequestsArtifacts(CRFunctionDTO CRFunctionDTO) {
			super(0L);
			this.CRFunctionDTO = CRFunctionDTO;
		}

		public void execute(Function function, String projectId) {

			Function funct = new Function(
										this.CRFunctionDTO.name,
										this.CRFunctionDTO.returnType,
										this.CRFunctionDTO.parameters,
										this.CRFunctionDTO.header,
										this.CRFunctionDTO.description,
										this.CRFunctionDTO.code,
										true,
										this.CRFunctionDTO.isReadOnly,
										projectId);

			for( StubDTO stub : CRFunctionDTO.stubs ){
				StubCommand.create(stub.inputs, stub.output, funct.getId(), true, stub.isReadOnly);
			}
		}
	}
	protected static class Create extends FunctionCommand {
		private String name;
		private String returnType;
		private List<FunctionParameterDTO> parameters;
		private String header;
		private String description;
		private String code;
		private boolean isReadOnly;
		private boolean isApiArtifact;

		public Create(String name, String returnType, List<FunctionParameterDTO> parameters,
				String header, String description, String code, boolean isApiArtifact, boolean isReadOnly) {
			super(0L);
			this.name 		   = name;
			this.returnType    = returnType;
			this.parameters    = parameters;
			this.header        = header;
			this.description   = description;
			this.code 		   = code;
			this.isApiArtifact = isApiArtifact;
			this.isReadOnly	   = isReadOnly;
		}

		public void execute(Function function, String projectId) {
			new Function(name, returnType, parameters, header, description, code, isApiArtifact, isReadOnly, projectId);
		}
	}

	protected static class RemoveCaller extends FunctionCommand {
		private long callerFunctionID;

		public RemoveCaller(long functionId, long callerFunctionID) {
			super(functionId);
			this.callerFunctionID = callerFunctionID;
		}

		public void execute(Function function, String projectId) {
				function.removeCaller(callerFunctionID);
		}
	}

	protected static class AddCaller extends FunctionCommand {
		private long callerFunctionID;

		public AddCaller(long functionId, long callerFunctionID) {
			super(functionId);
			this.callerFunctionID = callerFunctionID;
		}

		public void execute(Function function, String projectId)
		{
				function.addCaller(callerFunctionID);
		}
	}

	protected static class CalleeChangedInterface extends FunctionCommand {
		private long calleeId;
		private int oldCalleeVersion;

		public CalleeChangedInterface(long functionId, long calleeId, int oldCalleeVersion) {
			super(functionId);
			this.calleeId = calleeId;
			this.oldCalleeVersion = oldCalleeVersion;
		}

		public void execute(Function function, String projectId) {
			function.calleeChangedInterface(calleeId, oldCalleeVersion);
		}
	}

	protected static class RunTests extends FunctionCommand {

		public RunTests(long functionId) {
			super(functionId);
		}

		public void execute(Function function, String projectId) {
			function.runTests();
		}
	}

	protected static class CalleeBecomeDeactivated extends FunctionCommand {
		private long calleeId;
		private String disputeText;

		public CalleeBecomeDeactivated(long functionId, long calleeId,
				String disputeText) {
			super(functionId);
			this.calleeId = calleeId;
			this.disputeText = disputeText;
		}

		public void execute(Function function, String projectId) {
			function.calleeBecomeDeactivated(calleeId, disputeText );
		}
	}

	protected static class DisputeFunctionSignature extends FunctionCommand {
		private String issueDescription;
		private long artifactId;

		public DisputeFunctionSignature(long functionId, String issueDescription, long artifactId) {
			super(functionId);
			this.issueDescription = issueDescription;
			this.artifactId = artifactId;
		}

		public void execute(Function function, String projectId) {
			function.disputeFunctionSignature(issueDescription, artifactId, projectId);
		}
	}

	protected static class SubmittedTestResult extends FunctionCommand {
		private String jsonDto;

		public SubmittedTestResult(long functionId, String jsonDto) {
			super(functionId);

			this.jsonDto = jsonDto;
		}

		public void execute(Function function, String projectId) {
			function.submittedTestResult(jsonDto);
		}
	}

	protected static class AddTest extends FunctionCommand {
		private long testId;

		public AddTest(long functionId, long testId) {
			super(functionId);
			this.testId	= testId;

		}

		public void execute(Function function, String projectId) {
			function.addTest(testId);
		}
	}

	protected static class AddStub extends FunctionCommand {
		private long stubId;

		public AddStub(long functionId, long stubId) {
			super(functionId);
			this.stubId	= stubId;

		}

		public void execute(Function function, String projectId) {
			function.addStub(stubId);
		}
	}

	protected static class IncrementTestSuite extends FunctionCommand {

		public IncrementTestSuite(long functionId) {
			super(functionId);

		}

		public void execute(Function function, String projectId) {
			function.incrementTestSuiteVersion();
		}
	}

}
