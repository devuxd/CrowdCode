package com.crowdcoding.commands;

import com.crowdcoding.dto.ajax.microtask.submission.TestDTO;
import com.crowdcoding.entities.artifacts.AdvancedTest;
import com.crowdcoding.servlets.ThreadContext;


public abstract class AdvancedTestCommand extends Command {
	protected long advancedTestId;

	public static AdvancedTestCommand create(TestDTO advancedTest, long functionId, boolean isApiArtifact, boolean isReadOnly) {
		return new Create(advancedTest, functionId, isApiArtifact, isReadOnly);
	}

	public static AdvancedTestCommand update(long advancedTestId, String description,
			String code) {
		return new Update(advancedTestId, description, code );
	}

	public static AdvancedTestCommand delete(long advancedTestId) {
		return new Delete(advancedTestId);
	}

	private AdvancedTestCommand(Long advancedTestId) {
		this.advancedTestId = advancedTestId;
		queueCommand(this);
	}

	// All constructors for advancedTestCommand MUST call queueCommand and the end of
	// the constructor to add the
	// command to the queue.
	private static void queueCommand(Command command) {
		ThreadContext threadContext = ThreadContext.get();
        threadContext.addCommand(command);
	}

	public void execute(final String projectId) {
    	if (advancedTestId != 0) {
			AdvancedTest advancedTest = AdvancedTest.find(advancedTestId);

			if (advancedTest == null)
				System.out
						.println("errore Cannot execute advancedTestCommand. Could not find advancedTest for advancedTestID "
								+ advancedTestId);
			else {
				execute(advancedTest, projectId);
			}
		} else
			execute(null, projectId);

	}

	public abstract void execute(AdvancedTest advancedTest, String projectId);

	protected static class Create extends AdvancedTestCommand {
		private TestDTO test;
		private long functionId;
		private boolean isApiArtifact;
		private boolean isReadOnly;

		public Create(TestDTO test, long functionId, boolean isApiArtifact, boolean isReadOnly ) {
			super(0L);
			this.test = test;
			this.functionId = functionId;
			this.isApiArtifact = isApiArtifact;
			this.isReadOnly = isReadOnly;
		}

		public void execute(AdvancedTest advancedTest, String projectId) {
			System.out.println("CREATING advancedTest "+test.description);
			new AdvancedTest(test, functionId, isApiArtifact, isReadOnly, projectId);
		}
	}

	protected static class Update extends AdvancedTestCommand {

		private String description;
		private String code;

		public Update( long advancedTestId, String description, String code ) {
			super(advancedTestId);
			this.description  = description;
			this.code		  = code;
		}

		public void execute(AdvancedTest advancedTest, String projectId) {
			System.out.println("UPDATING advancedTest "+description);
			advancedTest.update( description, code );
		}
	}

	protected static class Delete extends AdvancedTestCommand {
		public Delete(long advancedTestId) {
			super(advancedTestId);
		}

		public void execute(AdvancedTest advancedTest, String projectId) {
			advancedTest.delete();
		}
	}

}
