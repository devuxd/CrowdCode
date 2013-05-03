package com.crowdcoding.util;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.HashMap;
import java.util.List;

import org.apache.commons.lang3.StringEscapeUtils;

import com.crowdcoding.Project;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.dto.FullDescriptionsDTO;

public class FunctionHeaderUtil
{
	private static final String unimplementedFunctionBody = "{ throw new NotImplementedException(); }";
	// Function declarations for functions to insert for running testing infrastructure.
	private static final String testingFunctions = "function NotImplementedException() {}";		
		
	public static String returnFunctionHeaderFormatted(Function function)
	{
		String fullDescription = function.getDescription() + function.getHeader();
		return fullDescription.replaceAll("\n", "<BR>");
	}
	
	// need a better place for this do not know where a util function is
	public static String getAllFunctions(Function currentFunctionIn, Project project)
	{
		List<Function> listOFunctions = ofy().load().type(Function.class).ancestor(project.getKey()).list();
		StringBuilder b = new StringBuilder();
		b.append(testingFunctions);		
		for(Function function : listOFunctions)
		{
			// if current function we are debugging equals
			// the loop then skip do not add again because 
			// current function's code may be different since
			// user is editing it
			if(function.equals(currentFunctionIn))
			{
				continue;
			}
			
			b.append(function.getHeader());
			
			// If the function is written, use the actual code. Otherwise, use the unimplemented body.
			if (function.isWritten())
				b.append(function.getEscapedCode());
			else
				b.append(StringEscapeUtils.escapeEcmaScript(unimplementedFunctionBody));			
		}
		return b.toString();
				
		// this will make lint formated globals if we ever need, just need merge with unitTestGlobals inside errorCheck.js
//		String a = b.toString();
//		String[] temp = a.split("[\\w]+\\(");
//		for(int i = 0; i < temp.length; i++)
//		{
//			a = a.replace(temp[i], "");
//		}
//		a = a.replaceAll("\\(", " ");
//		a = a.replaceAll(" ", " :false, ");
//		a = a.trim();
//		a = a.substring(0, a.length()-1);
//		System.out.println(a);
	} 
		
	public static String getDescribedFunctionHeaders(Function currentFunctionIn, Project project)
	{
		List<Function> listOFunctions = ofy().load().type(Function.class).ancestor(project.getKey())
				.filter("hasBeenDescribed", true).list();
		StringBuilder b = new StringBuilder();
		for(Function function : listOFunctions)
		{
			// if current function we are debugging equals
			// the loop then skip do not add again because 
			// current function's code may be different since
			// user is editing it
			if(function.equals(currentFunctionIn))
			{
				continue;
			}
			b.append(function.getHeader());
			b.append("{");
			b.append("} ");
		}
		return b.toString();
	}
	
	// Get full escaped descriptions for every described function in the system formatted as
	// a string in FullDescriptionsDTO format
	public static String getAllFullEscapedDescriptions(Project project)
	{
		List<Function> functions = ofy().load().type(Function.class).ancestor(project.getKey())
				.filter("hasBeenDescribed", true).list();
		
		HashMap<String, String> functionNameToDescription = new HashMap<String, String>();
		for (Function function : functions)
			functionNameToDescription.put(function.getName(), function.getFullDescription());
		
		FullDescriptionsDTO dto = new FullDescriptionsDTO(functionNameToDescription);
		return dto.json();
	}
}
