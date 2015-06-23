package com.crowdcoding.dto.ajax.microtask.submission;

import org.apache.commons.lang3.StringEscapeUtils;

import com.crowdcoding.dto.DTO;
import com.crowdcoding.entities.Artifacts.Test;


public class ADTStructureDTO extends DTO
{
	public String name;
	public String type;

	// Default constructor
	public ADTStructureDTO()
	{
	}
	public ADTStructureDTO( String name, String type){
		this.name = name;
		this.type = type;
	}

}
