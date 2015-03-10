package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;

public class TestDisputedDTO extends DTO
{
	public String messageType = "TestDisputedDTO";
	public Long id ;
	public String disputeText ="";      // only available if the test is in dispute.

	// Default constructor (required by Jackson JSON library)
	public TestDisputedDTO()
	{
	}

	public TestDisputedDTO(Long id, String disputeText)
	{
		this.id      = id;
		this.disputeText = disputeText;

	}
}