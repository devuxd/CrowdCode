package com.crowdcoding.dto;

public class issuedDTO extends DTO
{
	public String reissuedFrom;

	public issuedDTO()
	{
	}

	public issuedDTO(String name, String type)
	{
		this.reissuedFrom = name;
	}
}
