package com.crowdcoding.dto;

import java.util.List;

public class ADTDTO extends DTO 
{
	public String name;
	public String description;
	public List<FieldDTO> structure;	
	
	public ADTDTO()
	{		
	}
	
	public ADTDTO(String name, String description, List<FieldDTO> structure)
	{
		this.name = name;
		this.description = description;
		this.structure = structure;
	}
}
