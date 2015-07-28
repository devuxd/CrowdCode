package com.crowdcoding.commands;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.List;

import com.crowdcoding.entities.artifacts.Stub;
import com.crowdcoding.servlets.ThreadContext;
import com.googlecode.objectify.LoadResult;
import com.googlecode.objectify.VoidWork;

public abstract class StubCommand extends Command {
	protected long stubId;

	public static StubCommand create( String inputsKey, String output, long functionId, boolean isApiArtifact, boolean isReadOnly ) {
		return new Create(inputsKey, output, functionId, isApiArtifact, isReadOnly);
	}

	public static StubCommand update(long stubId, String output) {
		return new Update(stubId, output );
	}

	public static StubCommand delete(long stubId) {
		return new Delete(stubId);
	}

	private StubCommand(Long stubId) {
		this.stubId = stubId;
		queueCommand(this);
	}

	// All constructors for StubCommand MUST call queueCommand and the end of
	// the constructor to add the
	// command to the queue.
	private static void queueCommand(Command command) {
		ThreadContext threadContext = ThreadContext.get();
        threadContext.addCommand(command);
	}

	public void execute(final String projectId) {
    	if (stubId != 0) {
			Stub stub = Stub.find(stubId);

			if (stub == null)
				System.out
						.println("errore Cannot execute StubCommand. Could not find Stub for stubId "
								+ stubId);
			else {
				execute(stub, projectId);
			}
		} else
			execute(null, projectId);

	}

	public abstract void execute(Stub Stub, String projectId);

	protected static class Create extends StubCommand {
		private String inputsKey;
		private String output;
		private long functionId;
		private boolean isApiArtifact;
		private boolean isReadOnly;

		public Create( String inputsKey, String output, long functionId, boolean isApiArtifact, boolean isReadOnly) {
			super(0L);
			this.inputsKey 	   = inputsKey;
			this.output 	   = output;
			this.functionId	   = functionId;
			this.isApiArtifact = isApiArtifact;
			this.isReadOnly    = isReadOnly;
		}

		public void execute(Stub stub, String projectId) {
			new Stub(inputsKey, output, functionId, isApiArtifact, isReadOnly, projectId);
		}
	}

	protected static class Update extends StubCommand {

		private String output;

		public Update( long stubId, String output ) {
			super(stubId);
			this.output = output;
		}

		public void execute(Stub stub, String projectId) {
			stub.update( output );
		}
	}

	protected static class Delete extends StubCommand {
		public Delete(long stubId) {
			super(stubId);
		}

		public void execute(Stub stub, String projectId) {
			stub.delete();
		}
	}

}