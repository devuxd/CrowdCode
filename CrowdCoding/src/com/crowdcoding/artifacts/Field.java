package com.crowdcoding.artifacts;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.FieldDTO;
import com.googlecode.objectify.annotation.Embed;

@Embed
public class Field 
{
	public String name;
	public String type;
	
	// Default constructor for deserialization
	protected Field()
	{		
	}
	
	public Field(String name, String type)
	{
		this.name = name;
		this.type = type;
	}
	
	// Creates a list of Field objects from a list of FieldDTO objects
	public static List<Field> createFieldsFromFieldsDTO(List<FieldDTO> fieldDTOs)
	{
		List<Field> fields = new ArrayList<Field>();
		
		for (FieldDTO fieldDTO : fieldDTOs)		
			fields.add(new Field(fieldDTO.name, fieldDTO.type));

		return fields;			
	}	
	
	public String toString()
	{
		return name + ": " + type;
	}
}
