package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;

public class QuestionDTO extends DTO
{
	public String messageType = "QuestionDTO";
	public long    id;
	public String  title;
	public String  text;
	public String  artifactId;
	public boolean closed;
	public List<String> tags = new ArrayList<String>();

	// Default constructor (required by Jackson JSON library)
	public QuestionDTO()
	{
	}
}
