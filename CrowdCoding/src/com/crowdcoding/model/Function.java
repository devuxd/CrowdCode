package com.crowdcoding.model;

import java.util.ArrayList;
import java.util.List;

public class Function 
{
	public String code = "";
	public List<String> tests = new ArrayList<String>();
	
	public String toString()
	{
		return code + "\n\n" + tests.toString();
	}
}
