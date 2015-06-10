package com.crowdcoding.history;


public class QuestionViewed extends HistoryEvent 
{
	public String eventType = "question.viewed";
	public String projectId;
	public String questionId;
	public String workerId;
	
	public QuestionViewed(Long questionId,String workerId,String projectId)
	{
		super();
		this.projectId  = projectId;
		this.questionId = questionId.toString();
		this.workerId   = workerId;
		
	}

	public String getEventType(){
		return eventType;
	}
}
