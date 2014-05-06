package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.artifacts.ADT;
import com.crowdcoding.artifacts.Field;

public class ADTsDTO extends DTO 
{
	public List<ADTDTO> ADTs;
	
	public ADTsDTO()
	{		
	}
	
	public ADTsDTO(List<ADTDTO> adts)
	{
		this.ADTs = adts;
	}
	
	public static ADTsDTO buildFromADTs(List<ADT> adts)
	{
		List<ADTDTO> adtsDTO = new ArrayList<ADTDTO>();
		
		for (ADT adt : adts)
		{
			List<FieldDTO> fieldDTOs = new ArrayList<FieldDTO>();
			for (Field field : adt.fields())
				fieldDTOs.add(new FieldDTO(field.name, field.type));
			adtsDTO.add(new ADTDTO(adt.name(), adt.description(), fieldDTOs));		
		}
		
		return new ADTsDTO(adtsDTO);
	}
}
