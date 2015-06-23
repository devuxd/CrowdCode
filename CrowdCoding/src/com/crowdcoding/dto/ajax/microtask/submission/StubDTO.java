package com.crowdcoding.dto.ajax.microtask.submission;

import java.util.List;

import org.apache.commons.lang3.StringEscapeUtils;

import com.crowdcoding.dto.DTO;
import com.crowdcoding.entities.artifacts.Test;


public class StubDTO extends DTO
{
	public List<String> inputs;
	public String output;
	public boolean isReadOnly = false;

	// Default constructor
	public StubDTO()
	{
	}

}
