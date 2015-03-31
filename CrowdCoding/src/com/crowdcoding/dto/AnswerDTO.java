package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;

public class AnswerDTO extends DTO
{
	public String messageType = "AnswerDTO";
	public long questionId;
	public String text;

	// Default constructor (required by Jackson JSON library)
	public AnswerDTO()
	{
	}
}
