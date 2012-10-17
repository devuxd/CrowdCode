package com.crowdcoding.model;

import java.util.List;

public class Entrypoint 
{
	public List<Parameter> parameters;
	public String name;
	public String event;
	
	public String toString()
	{
		return event + " function " + name + "(" + parameters.toString() + ")";
	}
}
