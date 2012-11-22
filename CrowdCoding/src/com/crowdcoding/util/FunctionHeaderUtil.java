package com.crowdcoding.util;

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
}
