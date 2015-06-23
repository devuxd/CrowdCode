package com.crowdcoding.dto.firebase.artifacts;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ajax.microtask.submission.ADTStructureDTO;

public class ADTInFirebase extends DTO
{
	public String messageType = "ADTInFirebase";
	public long id;
	public int version;
	public String description;
	public String name;
	public List<ADTStructureDTO> structure = new ArrayList<ADTStructureDTO>();
	public boolean isReadOnly;
	public boolean isApiArtifact;
	public boolean isDeleted;


	// Default constructor
	public ADTInFirebase()
	{
	}
	public ADTInFirebase(long id, int version, String description, String name, HashMap<String, String> structure,
			boolean isReadOnly, boolean isApiArtifact, boolean isDeleted )
	{
		this.id			  = id ;
		this.description  = description;
		this.name 		  = name;

		for(String StructureName : structure.keySet()){
			this.structure.add(new ADTStructureDTO(StructureName, structure.get(StructureName)));
		}

		this.version	   = version;
		this.isReadOnly    = isReadOnly;
		this.isApiArtifact = isApiArtifact;
		this.isDeleted	   = isDeleted;

	}

}
