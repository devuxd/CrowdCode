package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;

public class FunctionDTO 
{
	public String code = "";
	public List<String> tests = new ArrayList<String>();
	
	public String toString()
	{
		return code + "\n\n" + tests.toString();
	}
}
