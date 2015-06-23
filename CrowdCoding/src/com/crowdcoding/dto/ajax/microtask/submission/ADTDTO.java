package com.crowdcoding.dto.ajax.microtask.submission;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.crowdcoding.dto.DTO;


public class ADTDTO extends DTO
{
	public String description;
	public String name;
	public List<ADTStructureDTO> structure;
	public List<ADTExampleDTO> examples =  new ArrayList<ADTExampleDTO>();
	public boolean isReadOnly = false;

	// Default constructor
	public ADTDTO()
	{
	}

	public HashMap<String, String> getStructure(){
		HashMap<String, String> mapStructure = new HashMap<String, String>();
		for(ADTStructureDTO ADTStructure : structure){
			mapStructure.put(ADTStructure.name, ADTStructure.type);
		}
		return mapStructure;
	}
}
