package com.crowdcoding.artifacts.commands;

import com.crowdcoding.Project;
import com.crowdcoding.servlets.CommandContext;

public abstract class ProjectCommand extends Command 
{
	public static ProjectCommand queueMicrotask(long microtaskID) 
		{ return new QueueMicrotask(microtaskID); }
	public static ProjectCommand skipMicrotask(long microtaskID, String workerID) 
		{ return new SkipMicrotask(microtaskID, workerID); }
	public static ProjectCommand submitMicrotask(long microtaskID, String jsonDTOData, String workerID) 
		{ return new SubmitMicrotask(microtaskID, jsonDTOData, workerID); }

	private ProjectCommand()
	{
		queueCommand(this);
	}	
	
	// All constructors for ProjectCommand MUST call queueCommand by calling the super constructor
	private static void queueCommand(Command command)
	{
		CommandContext.ctx.addCommand(command);
	}
			
	protected static class QueueMicrotask extends ProjectCommand
	{
		private long microtaskID;
		
		public QueueMicrotask(long microtaskID)
		{
			super();
			this.microtaskID = microtaskID;
		}
		
		public void execute(Project project)
		{
			project.queueMicrotask(microtaskID);
		}		
	}
	
	protected static class SkipMicrotask extends ProjectCommand
	{
		private long microtaskID;
		private String workerID;
		
		public SkipMicrotask(long microtaskID, String workerID)
		{
			super();
			this.microtaskID = microtaskID;
			this.workerID = workerID;
		}
		
		public void execute(Project project)
		{
			project.skipMicrotask(microtaskID, workerID, project);
		}		
	}
	
	protected static class SubmitMicrotask extends ProjectCommand
	{
		private long microtaskID;
		private String jsonDTOData;
		private String workerID;
		
		public SubmitMicrotask(long microtaskID, String jsonDTOData, String workerID)
		{
			super();
			this.microtaskID = microtaskID;
			this.jsonDTOData = jsonDTOData;
			this.workerID = workerID;
		}
		
		public void execute(Project project)
		{
			project.submitMicrotask(microtaskID, jsonDTOData, workerID, project);
		}		
	}
}
