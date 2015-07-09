package com.crowdcoding.commands;


import java.util.HashMap;


import com.crowdcoding.entities.artifacts.*;
import com.crowdcoding.servlets.ThreadContext;

public abstract class ADTCommand extends Command {
	protected long ADTId;

	public static ADTCommand create (String description, String name, HashMap<String,String> structure, boolean isApiArtifact, boolean isReadOnly) {
		return new Create( description, name, structure, isApiArtifact, isReadOnly );
	}

	public static ADTCommand update(long ADTId, String description, String name, HashMap<String,String> structure) {
		return new Update(ADTId, description, name, structure );
	}

	public static ADTCommand delete(long ADTId) {
		return new Delete(ADTId);
	}

	private ADTCommand(Long ADTId) {
		this.ADTId = ADTId;
		queueCommand(this);
	}

	// All constructors for ADTCommand MUST call queueCommand and the end of
	// the constructor to add the
	// command to the queue.
	private static void queueCommand(Command command) {
		ThreadContext threadContext = ThreadContext.get();
        threadContext.addCommand(command);
	}

	public void execute(final String projectId) {
    	if (ADTId != 0) {
			ADT adt = ADT.find(ADTId);

			if (adt == null)
				System.out
						.println("errore Cannot execute ADTCommand. Could not find ADT for ADTID "
								+ ADTId);
			else {
				execute(adt, projectId);
			}
		} else
			execute(null, projectId);

	}

	public abstract void execute(ADT ADT, String projectId);

	protected static class Create extends ADTCommand {
		private String description;
		private String name;
		private HashMap<String,String> structure;
		private boolean isApiArtifact;
		private boolean isReadOnly;


		public Create(String description, String name, HashMap<String,String> structure, boolean isApiArtifact, boolean isReadOnly) {
			super(0L);
			this.description   = description;
			this.name		   = name;
			this.structure	   = structure;
			this.isApiArtifact = isApiArtifact;
			this.isReadOnly    = isReadOnly;

		}

		public void execute(ADT ADT, String projectId) {
			new ADT( description, name, structure, isApiArtifact, isReadOnly , projectId);
		}
	}

	protected static class Update extends ADTCommand {

		private String description;
		private String name;
		private HashMap<String,String> structure;

		public Update( long ADTId, String description, String name, HashMap<String,String> structure ) {
			super(ADTId);
			this.description  = description;
			this.name		  = name;
			this.structure    = structure;
		}

		public void execute(ADT adt, String projectId) {
			adt.update( description, name, structure );
		}
	}

	protected static class Delete extends ADTCommand {
		public Delete(long ADTId) {
			super(ADTId);
		}

		public void execute(ADT adt, String projectId) {
			adt.delete();
		}
	}

}
