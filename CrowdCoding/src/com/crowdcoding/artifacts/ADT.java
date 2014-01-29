package com.crowdcoding.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.crowdcoding.Project;
import com.crowdcoding.dto.ADTDTO;
import com.crowdcoding.dto.ADTsDTO;
import com.crowdcoding.dto.FullDescriptionsDTO;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.cmd.Query;

@EntitySubclass(index=true)
public class ADT extends Artifact 
{
	private String name;
	private String description;
	private List<Field> fields = new ArrayList<Field>();
	
	
	// Default constructor for deserialization
	protected ADT()
	{		
	}
	
	// Constructor for initialization. 
	public ADT(Project project, String name, String description, List<Field> fields)
	{
		super(project);
		
		this.name = name;
		this.description = description;
		this.fields = fields;
		
		ofy().save().entity(this).now();
	}

	// creates and returns a new ADT from an ADTDTO
	public static ADT createFromDTO(Project project, ADTDTO adtDTO)
	{
		return new ADT(project, adtDTO.name, adtDTO.description, Field.createFieldsFromFieldsDTO(adtDTO.structure));
	}
	
	public String name()
	{
		return name;
	}
	
	public String description()
	{
		return description;
	}
	
	public List<Field> fields()
	{
		return fields;
	}
	
	public String toString()
	{
		return name + " - { " + fields.toString() + " } "; 
	}
	
	public static String StatusReport(Project project)
	{
		StringBuilder output = new StringBuilder();		
		output.append("**** ALL ADTs ****\n");
		
		Query<ADT> q = ofy().load().type(ADT.class).ancestor(project.getKey());		
		for (ADT adt : q)
			output.append(adt.toString() + "\n");
		
		return output.toString();
	}
	
	// Get all ADTs in the project formatted as a String of JSON in ADTsDTO format 
	public static String getAllADTs(Project project)
	{
		List<ADT> adts = ofy().load().type(ADT.class).ancestor(project.getKey()).list();		
		return ADTsDTO.buildFromADTs(adts).json();
	}
}
