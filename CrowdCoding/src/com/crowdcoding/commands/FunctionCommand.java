package com.crowdcoding.commands;


import java.util.List;

import com.crowdcoding.dto.CRFunctionDTO;
import com.crowdcoding.dto.ajax.microtask.submission.FunctionDTO;
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

	public static FunctionCommand createRequestedFunction(long requestingFunctionId, FunctionDTO requestedFunction) {
		return new CreateRequestedFunction( requestingFunctionId, requestedFunction);
	}

	public static FunctionCommand removeCaller(long functionId,
			long callerFunctionID) {
		return new RemoveCaller(functionId, callerFunctionID);
	}

	public static FunctionCommand addCaller(long functionId,
			long callerFunctionID) {
		return new AddCaller(functionId, callerFunctionID);
	}

	public static FunctionCommand addCallee(long functionId,
			long calleeFunctionId) {
		return new AddCaller(functionId, calleeFunctionId);
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

	public static FunctionCommand addTest(long functionId, long testId) {
		return new AddTest(functionId, testId);
	}

	public static FunctionCommand addStub(long functionId, long stubId) {
		return new AddTest(functionId, stubId);
	}

	public static FunctionCommand incrementTestSuite(long functionId) {
		return new IncrementTestSuite(functionId);
	}


	public static FunctionCommand lookForWork(long functionId) {
		return new LookForWork(functionId);
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
				StubCommand.create(stub.inputsKey, stub.output, funct.getId(), true, stub.isReadOnly);
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

	protected static class CreateRequestedFunction extends FunctionCommand {

		private FunctionDTO requestedFunction;
		private long requestingFunctionId;

		public CreateRequestedFunction(long requestingFunctionId, FunctionDTO requestedFunction) {
			super(0L);

			this.requestedFunction	  = requestedFunction;
			this.requestingFunctionId = requestingFunctionId;
		}

		public void execute(Function funct, String projectId) {

			Function function = new Function(requestedFunction.name, requestedFunction.returnType, requestedFunction.parameters, requestedFunction.header, requestedFunction.description, "{\n    return -1;\n}", false, false, projectId);

			function.addCaller(requestingFunctionId);

			FunctionCommand.addCallee(requestingFunctionId, function.getId());
			
			for( StubDTO stub : requestedFunction.stubs){
				StubCommand.create(stub.inputsKey, stub.output, function.getId(), false, false);
			}
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

	protected static class AddCallee extends FunctionCommand {
		private long calleeFunctionId;

		public AddCallee(long functionId, long calleeFunctionId) {
			super(functionId);
			this.calleeFunctionId = calleeFunctionId;
		}

		public void execute(Function function, String projectId)
		{
				function.addCallee(calleeFunctionId);
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


	protected static class LookForWork extends FunctionCommand {

		public LookForWork(long functionId) {
			super(functionId);

		}

		public void execute(Function function, String projectId) {
			function.lookForWork();
		}
	}

}
