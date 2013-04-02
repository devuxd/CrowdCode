package com.crowdcoding.util;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.List;

import org.mortbay.util.Pool.PondLife;

import com.crowdcoding.Project;
import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Parameter;
import com.crowdcoding.dto.FunctionDescriptionDTO;
import com.crowdcoding.dto.ParameterDTO;

public class FunctionHeaderUtil
{
	/**
	 * Checks to see if function signature matches
	 * @param dto, describe function to check
	 * @return true if there is a match
	 */
	public static boolean checkForDuplicateFunction(FunctionDescriptionDTO dto,Project project)
	{
		List<Function> listOFunctions = ofy().load().type(Function.class).ancestor(project.getKey()).list();
		for(Function function: listOFunctions)
		{
			if(function.getName() == null || function.getParameters() == null)
			{
				continue;
			}
			if(function.getName().equals(dto.name) && checkParameters(function.getParameters(),dto.parameters))
			{
				// has a duplicate
				return true;
			}
		}
		return false;
	}
	/**
	 * returns if two functions match in parameters
	 * @param parameters
	 * @param parameters2
	 * @return true if they are the same parameters
	 */
	private static boolean checkParameters(List<Parameter> parameters,
			List<ParameterDTO> parameters2)
	{
		// since it is javascript if same number of parameters then its true
		return parameters.size() == parameters2.size();
		
	}
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
