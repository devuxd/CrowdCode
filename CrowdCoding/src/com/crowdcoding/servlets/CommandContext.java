package com.crowdcoding.servlets;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

import com.crowdcoding.commands.Command;
import com.crowdcoding.entities.Project;

/* An execution context represents the top level context for a Command that is currently being executed.
 * State that is local to the command execution context can be stored here.
 */
public class CommandContext
{
	public static CommandContext ctx;  // currently active execution context

	private static HashMap<Long, Queue<Command>> CommandsMap = new HashMap<Long, Queue<Command>>();

	// Execution contexts should only be created by the CrowdServlet as it is processing requests.
	public CommandContext()
	{
		CommandsMap.put(Thread.currentThread().getId(), new LinkedList<Command>());
		CommandContext.ctx = this;
	}

	public void addCommand(Command command)
	{
		CommandsMap.get(Thread.currentThread().getId()).add(command);
	}
	public Queue<Command> commands()
	{
		return new LinkedList<Command> (CommandsMap.get(Thread.currentThread().getId()));

	}

}
