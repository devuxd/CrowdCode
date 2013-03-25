package com.crowdcoding.util;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.List;

import com.crowdcoding.Project;
import com.crowdcoding.artifacts.Function;

public class FunctionHeaderUtil
{
	public static String returnFunctionHeaderFormatted(Function function)
	{
		StringBuilder b = new StringBuilder();
		b.append("Function Description: " + function.getDescription() +" <BR><BR>");
		b.append("returns " + function.getReturnType());
		b.append("<BR><BR>");
		b.append(function.getFunctionDisplayHeader().replaceAll("\\)",")<BR>"));
		b.append(" <BR>");
		return b.toString();
	}
	
	// need a better place for this do not know where a util function is
	public static String getAllActiveFunctions(Function currentFunctionIn, Project project)
	{
		List<Function> listOFunctions = ofy().load().type(Function.class).ancestor(project.getKey())
				.filter("isWritten", true).list();
		StringBuilder b = new StringBuilder();
		for(Function function : listOFunctions)
		{
			// TODO: what does it mean to be equal?
			// if current function we are debugging equals
			// the loop then skip do not add again because 
			// current function's code may be different since
			// user is editing it
			if(function.equals(currentFunctionIn))
			{
				continue;
			}
			// this will make lint formated globals if we ever need, just need merge with unitTestGlobals inside errorCheck.js
//			String a = b.toString();
//			String[] temp = a.split("[\\w]+\\(");
//			for(int i = 0; i < temp.length; i++)
//			{
//				a = a.replace(temp[i], "");
//			}
//			a = a.replaceAll("\\(", " ");
//			a = a.replaceAll(" ", " :false, ");
//			a = a.trim();
//			a = a.substring(0, a.length()-1);
//			System.out.println(a);
			b.append(function.getFunctionHeader());
			b.append("{");
			b.append(function.getEscapedCode());
			b.append("}");
		}
		return b.toString();
	} 
	
	public static String getAllActiveFunctionsHeader(Function currentFunctionIn, Project project)
	{
		List<Function> listOFunctions = ofy().load().type(Function.class).ancestor(project.getKey())
				.filter("isWritten", true).list();
		StringBuilder b = new StringBuilder();
		for(Function function : listOFunctions)
		{
			// TODO: what does it mean to be equal?
			// if current function we are debugging equals
			// the loop then skip do not add again because 
			// current function's code may be different since
			// user is editing it
			if(function.equals(currentFunctionIn))
			{
				continue;
			}
			b.append(function.getFunctionHeader());
			b.append("{");
			b.append("}");
		}
		return b.toString();
	} 
}
