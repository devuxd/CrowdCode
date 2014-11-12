package com.crowdcoding.dto;

import org.apache.commons.lang3.StringEscapeUtils;

import com.crowdcoding.entities.Test;


public class TestCaseDTO extends DTO
{
	public String messageType = "TestCaseDTO";
	public String text;
	public boolean added;
	public boolean deleted;
	public long id;				// id of the corresponding test. Only valid if added is false.
	public int functionVersion;

	// Default constructor
	public TestCaseDTO()
	{
	}

	// Build a TestCaseDTO from a test, building escaped Strings
	public TestCaseDTO(Test test, int functionVersion)
	{
		this.functionVersion=functionVersion;
		this.text = StringEscapeUtils.escapeEcmaScript(test.getDescription());
		this.added = false;
		this.deleted = false;
		this.id = test.getID();
	}

	public String toString()
	{
		return text;
	}
}
