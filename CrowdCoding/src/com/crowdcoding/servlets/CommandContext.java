package com.crowdcoding.servlets;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.Project;
import com.crowdcoding.artifacts.commands.Command;

/* An execution context represents the top level context for a Command that is currently being executed. 
 * State that is local to the command execution context can be stored here.
 */
public class CommandContext 
{
	public static CommandContext ctx;  // currently active execution context
	
	private List<Command> commands = new ArrayList<Command>();

	// Execution contexts should only be created by the CrowdServlet as it is processing requests.
	public CommandContext() 
	{
		CommandContext.ctx = this;	
	}
	
	public void addCommand(Command command)
	{
		commands.add(command);
	}
	
	public List<Command> commands()
	{
		return commands;
	}
}
