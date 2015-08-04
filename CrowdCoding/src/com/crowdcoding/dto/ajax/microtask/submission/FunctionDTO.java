package com.crowdcoding.dto.ajax.microtask.submission;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;


public class FunctionDTO extends DTO
{
	public String messageType = "FunctionDTO";

	public Long   id;
	public String description;
	public String returnType;
	public List<FunctionParameterDTO> parameters = new ArrayList<FunctionParameterDTO>();
	public String header;
	public String name;
	public String code ;
	public List<FunctionDTO> callees = new ArrayList<FunctionDTO>();
	public List<TestDTO> tests = new ArrayList<TestDTO>();

}
