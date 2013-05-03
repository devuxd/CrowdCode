package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;

public class MocksDTO extends DTO 
{
	public String messageType = "MocksDTO";
	
	public List<MockDTO> mocks = new ArrayList<MockDTO>();
	
	// Default constructor (required by Jackson JSON library)
	public MocksDTO()
	{		
	}
	
	public MocksDTO(List<MockDTO> mocks)
	{
		this.mocks = mocks;
	}			
			
	public String toString()
	{
		return mocks.toString();
	}
}
