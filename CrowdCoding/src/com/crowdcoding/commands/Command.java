package com.crowdcoding.commands;

import com.crowdcoding.entities.Project;

public abstract class Command {
	public abstract void execute(Project project);
}
