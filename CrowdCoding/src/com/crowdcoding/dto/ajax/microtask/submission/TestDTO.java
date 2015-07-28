package com.crowdcoding.dto.ajax.microtask.submission;

import org.apache.commons.lang3.StringEscapeUtils;

import com.crowdcoding.dto.DTO;
import com.crowdcoding.entities.artifacts.Test;


public class TestDTO extends DTO
{
	public String description;
	public String code;
	public boolean deleted;
	public boolean added;
	public boolean edited;
	public long id;				// id of the corresponding test. Only valid if added is false.


	// Default constructor
	public TestDTO()
	{
	}

}