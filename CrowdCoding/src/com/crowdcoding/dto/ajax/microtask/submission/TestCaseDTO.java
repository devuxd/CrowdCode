package com.crowdcoding.dto.ajax.microtask.submission;

import org.apache.commons.lang3.StringEscapeUtils;

import com.crowdcoding.dto.DTO;
import com.crowdcoding.entities.Test;


public class TestCaseDTO extends DTO
{
	public String messageType = "TestCaseDTO";
	public String text;
	public boolean added;
	public boolean deleted;
	public boolean readOnly=false;
	public long id;				// id of the corresponding test. Only valid if added is false.


	// Default constructor
	public TestCaseDTO()
	{
	}

	// Build a TestCaseDTO from a test, building escaped Strings
	public TestCaseDTO(Test test, int functionVersion)
	{
		this.text = StringEscapeUtils.escapeEcmaScript(test.getDescription());
		this.added = false;
		this.deleted = false;
		this.id = test.getID();
		this.readOnly=false;

	}

	public String toString()
	{
		return text;
	}
}
