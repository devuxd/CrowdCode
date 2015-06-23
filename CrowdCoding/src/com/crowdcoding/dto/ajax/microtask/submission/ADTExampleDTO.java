package com.crowdcoding.dto.ajax.microtask.submission;

import org.apache.commons.lang3.StringEscapeUtils;

import com.crowdcoding.dto.DTO;
import com.crowdcoding.entities.artifacts.Test;


public class ADTExampleDTO extends DTO
{
	public String name;
	public String value;

	// Default constructor
	public ADTExampleDTO()
	{
	}
	public ADTExampleDTO( String name, String value){
		this.name = name;
		this.value = value;
	}

}
