package com.crowdcoding.dto;

public class IssuedDTO extends DTO
{
	public String reissuedFrom;

	public IssuedDTO()
	{
	}

	public IssuedDTO(String name, String type)
	{
		this.reissuedFrom = name;
	}
}
