package com.crowdcoding.commands;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.List;

import com.crowdcoding.entities.Artifacts.Test;
import com.crowdcoding.servlets.ThreadContext;
import com.googlecode.objectify.LoadResult;
import com.googlecode.objectify.VoidWork;

public abstract class TestCommand extends Command {
	protected long testId;

	public static TestCommand create(String description, String code, long functionId, boolean isApiArtifact, boolean isReadOnly) {
		return new Create(description, code, functionId, isApiArtifact, isReadOnly);
	}

	public static TestCommand update(long testId, String description,
			String code) {
		return new Update(testId, description, code );
	}

	public static TestCommand delete(long testId) {
		return new Delete(testId);
	}

	private TestCommand(Long testId) {
		this.testId = testId;
		queueCommand(this);
	}

	// All constructors for TestCommand MUST call queueCommand and the end of
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
						.println("errore Cannot execute TestCommand. Could not find test for TestID "
								+ testId);
			else {
				execute(test, projectId);
			}
		} else
			execute(null, projectId);

	}

	public abstract void execute(Test test, String projectId);

	protected static class Create extends TestCommand {
		private String description;
		private String code;
		private long functionId;
		private boolean isApiArtifact;
		private boolean isReadOnly;

		public Create(String description, String code,long functionId, boolean isApiArtifact, boolean isReadOnly ) {
			super(0L);
			this.description = description;
			this.code = code;
			this.functionId = functionId;
			this.isApiArtifact = isApiArtifact;
			this.isReadOnly = isReadOnly;
		}

		public void execute(Test test, String projectId) {
			new Test(description, code, functionId, isApiArtifact, isReadOnly, projectId);
		}
	}

	protected static class Update extends TestCommand {

		private String description;
		private String code;

		public Update( long testId, String description, String code ) {
			super(testId);
			this.description  = description;
			this.code		 = code;
		}

		public void execute(Test test, String projectId) {
			test.update( description, code );
		}
	}

	protected static class Delete extends TestCommand {
		public Delete(long testId) {
			super(testId);
		}

		public void execute(Test test, String projectId) {
			test.delete();
		}
	}

}
