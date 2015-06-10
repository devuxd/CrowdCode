package com.crowdcoding.dto;

import java.util.ArrayList;
import java.util.List;

public class CommentDTO extends DTO
{
	public String messageType = "CommentDTO";
	public long questionId;
	public long answerId;
	public String text;

	// Default constructor (required by Jackson JSON library)
	public CommentDTO()
	{
	}
}
