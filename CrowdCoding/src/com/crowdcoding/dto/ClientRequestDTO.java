package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.ajax.microtask.submission.ADTDTO;
import com.crowdcoding.dto.ajax.microtask.submission.FunctionDTO;
import com.crowdcoding.dto.ajax.microtask.submission.ImplementBehaviorDTO;


public class ClientRequestDTO extends DTO
{
	public String messageType = "ClientRequestDTO";

	public List<FunctionDTO> functions = new ArrayList<FunctionDTO>();
	public List<ADTDTO> ADTs = new ArrayList<ADTDTO>();


	// Default constructor (required by Jackson JSON library)
	public ClientRequestDTO()
	{
	}
}
