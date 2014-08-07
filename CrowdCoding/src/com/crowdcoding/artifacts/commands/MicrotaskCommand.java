package com.crowdcoding.artifacts.commands;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.Project;
import com.crowdcoding.microtasks.Microtask;
import com.crowdcoding.servlets.CommandContext;
import com.googlecode.objectify.Key;

public abstract class MicrotaskCommand extends Command 
{
	protected long microtaskID;
	
	public static MicrotaskCommand submit(long microtaskID, String jsonDTOData, String workerID) 
		{ return new Submit(microtaskID, jsonDTOData, workerID); }
	public static MicrotaskCommand skip(long microtaskID, String workerID) 
	{ return new Skip(microtaskID, workerID); }

	private MicrotaskCommand(long microtaskID)
	{
		this.microtaskID = microtaskID;
		queueCommand(this);
	}	
	
	// All constructors for WorkerCommand MUST call queueCommand by calling the super constructor
	private static void queueCommand(Command command)
	{
		CommandContext.ctx.addCommand(command);
	}
	
	public void execute(Project project)
	{
		Microtask microtask = find(microtaskID, project);
		if (microtask == null)		
			System.out.println("Cannot execute MicrotaskCommand. Could not find the microtask for microtaskID " 
						+ microtaskID);		
		else
		{
			execute(microtask, project);
		}
	}
	
	// Finds the specified microtask. Returns null if no such microtask exists.
	protected Microtask find(long microtaskID, Project project)
	{
		return ofy().load().key(Key.create(project.getKey(), Microtask.class, microtaskID)).get();
	}

	public abstract void execute(Microtask microtask, Project project);
		
	protected static class Submit extends MicrotaskCommand
	{
		private String jsonDTOData;
		private String workerID;
		
		public Submit(long microtaskID, String jsonDTOData, String workerID)
		{
			super(microtaskID);
			this.jsonDTOData = jsonDTOData;
			this.workerID = workerID;
		}
		
		public void execute(Microtask microtask, Project project)
		{
			microtask.submit(jsonDTOData, workerID, project);
		}		
	}
	
	protected static class Skip extends MicrotaskCommand
	{
		private String workerID;
		
		public Skip(long microtaskID, String workerID)
		{
			super(microtaskID);
			this.workerID = workerID;
		}
		
		public void execute(Microtask microtask, Project project)
		{
			microtask.skip(workerID, project);
		}		
	}
}
