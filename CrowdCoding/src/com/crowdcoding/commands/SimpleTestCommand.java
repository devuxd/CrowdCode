package com.crowdcoding.commands;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.List;

import com.crowdcoding.dto.ajax.microtask.submission.TestDTO;
import com.crowdcoding.entities.artifacts.SimpleTest;
import com.crowdcoding.servlets.ThreadContext;
import com.googlecode.objectify.LoadResult;
import com.googlecode.objectify.VoidWork;

public abstract class SimpleTestCommand extends Command {
	protected long simpleTestId;

	public static SimpleTestCommand create(TestDTO test, long functionId, boolean isApiArtifact, boolean isReadOnly ) {
		return new Create(test, functionId, isApiArtifact, isReadOnly);
	}

	public static SimpleTestCommand update(long simpleTestId, String output) {
		return new Update(simpleTestId, output );
	}

	public static SimpleTestCommand delete(long simpleTestId) {
		return new Delete(simpleTestId);
	}

	private SimpleTestCommand(Long simpleTestId) {
		this.simpleTestId = simpleTestId;
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
    	if (simpleTestId != 0) {
			SimpleTest simpleTest = SimpleTest.find(simpleTestId);

			if (simpleTest == null)
				System.out
						.println("errore Cannot execute simpleTestCommand. Could not find simpleTest for simpleTestId "
								+ simpleTestId);
			else {
				execute(simpleTest, projectId);
			}
		} else
			execute(null, projectId);

	}

	public abstract void execute(SimpleTest simpleTest, String projectId);

	protected static class Create extends SimpleTestCommand {
		private TestDTO test;
		private long functionId;
		private boolean isApiArtifact;
		private boolean isReadOnly;

		public Create( TestDTO test, long functionId, boolean isApiArtifact, boolean isReadOnly) {
			super(0L);
			this.test 		   = test;
			this.functionId	   = functionId;
			this.isApiArtifact = isApiArtifact;
			this.isReadOnly    = isReadOnly;
		}

		public void execute(SimpleTest simpleTest, String projectId) {
			new SimpleTest(test, functionId, isApiArtifact, isReadOnly, projectId);
		}
	}

	protected static class Update extends SimpleTestCommand {

		private String output;

		public Update( long simpleTestId, String output ) {
			super(simpleTestId);
			this.output = output;
		}

		public void execute(SimpleTest simpleTest, String projectId) {
			simpleTest.update( output );
		}
	}

	protected static class Delete extends SimpleTestCommand {
		public Delete(long simpleTestId) {
			super(simpleTestId);
		}

		public void execute(SimpleTest simpleTest, String projectId) {
			simpleTest.delete();
		}
	}

}
