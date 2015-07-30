package com.crowdcoding.dto.firebase.artifacts;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ajax.microtask.submission.ADTExampleDTO;
import com.crowdcoding.dto.ajax.microtask.submission.ADTStructureDTO;

public class ADTInFirebase extends DTO
{
	public String messageType = "ADTInFirebase";
	public long id;
	public int version;
	public String description;
	public String name;
	public List<ADTStructureDTO> structure = new ArrayList<ADTStructureDTO>();
	public List<ADTExampleDTO> examples = new ArrayList<ADTExampleDTO>();
	public boolean isReadOnly;
	public boolean isApiArtifact;
	public boolean isDeleted;


	// Default constructor
	public ADTInFirebase()
	{
	}
	public ADTInFirebase(long id, int version, String description, String name, HashMap<String, String> structure, HashMap<String, String> examples,
			boolean isReadOnly, boolean isApiArtifact, boolean isDeleted )
	{
		this.id			  = id ;
		this.description  = description;
		this.name 		  = name;

		for(String structureName : structure.keySet()){
			this.structure.add(new ADTStructureDTO(structureName, structure.get(structureName)));
		}

		for(String exampleName : examples.keySet()){
			this.examples.add(new ADTExampleDTO(exampleName, examples.get(exampleName)));
		}

		this.version	   = version;
		this.isReadOnly    = isReadOnly;
		this.isApiArtifact = isApiArtifact;
		this.isDeleted	   = isDeleted;

	}

}
