package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;

public class TestDisputedDTO extends DTO
{
	public String messageType = "TestDisputedDTO";
	public Long testId ;
	public String disputeText ="";      // only available if the test is in dispute.

	// Default constructor (required by Jackson JSON library)
	public TestDisputedDTO()
	{
	}

	public TestDisputedDTO(Long testId, String disputeText)
	{
		this.testId      = testId;
		this.disputeText = disputeText;

	}
}
