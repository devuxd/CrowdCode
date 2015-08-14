package com.crowdcoding.commands;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.List;

import com.crowdcoding.dto.ajax.microtask.submission.TestDTO;
import com.crowdcoding.entities.artifacts.Test;
import com.crowdcoding.servlets.ThreadContext;
import com.googlecode.objectify.LoadResult;
import com.googlecode.objectify.VoidWork;

public abstract class TestCommand extends Command {
	protected long testId;
	protected boolean isSimple;

	public static TestCommand create(TestDTO test, long functionId, boolean isApiArtifact, boolean isReadOnly ) {
		return new Create(test, functionId, isApiArtifact, isReadOnly);
	}

	public static TestCommand update(TestDTO test) {
		return new Update(test);
	}

	public static TestCommand delete(TestDTO test) {
		return new Delete(test);
	}

	private TestCommand(Long testId, boolean isSimple) {
		this.testId = testId;
		this.isSimple = isSimple;
		queueCommand(this);
	}

	// All constructors for simpleTestCommand MUST call queueCommand and the end of
	// the constructor to add the
	// command to the queue.
	private static void queueCommand(Command command) {
		ThreadContext threadContext = ThreadContext.get();
        threadContext.addCommand(command);
	}

	public void execute(final String projectId) {
    	if (testId != 0) {
    		
    		Test test = Test.find(testId);
    		
			if (test == null)
				System.out
						.println("errore Cannot execute test command. Could not find test for id "+testId);
			else {
				execute(test, projectId);
			}
		} else
			execute(null, projectId);

	}

	public abstract void execute(Test simpleTest, String projectId);

	protected static class Create extends TestCommand {
		private TestDTO testDto;
		private long functionId;
		private boolean isApiArtifact;
		private boolean isReadOnly;

		public Create( TestDTO testDto, long functionId, boolean isApiArtifact, boolean isReadOnly) {
			super(0L,testDto.isSimple);
			this.testDto	   = testDto;
			this.functionId	   = functionId;
			this.isApiArtifact = isApiArtifact;
			this.isReadOnly    = isReadOnly;
		}

		public void execute(Test test, String projectId) {
			System.out.println("CREATING "+testDto.description);
			new Test(testDto, functionId, isApiArtifact, isReadOnly, projectId);
		}
	}

	protected static class Update extends TestCommand {

		private TestDTO testDto;

		public Update( TestDTO testDto ) {
			super(testDto.id,testDto.isSimple);
			this.testDto = testDto;
		}

		public void execute(Test test, String projectId) {
			System.out.println("UPDATING "+test.getId());
			test.update( testDto );
		}
	}

	protected static class Delete extends TestCommand {

		public Delete(TestDTO testDto) {
			super(testDto.id,testDto.isSimple);
		
		}

		@Override
		public void execute(Test test, String projectId) {
			test.delete();
		}
	}

}
