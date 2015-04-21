package com.crowdcoding.commands;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;

import com.crowdcoding.dto.AnswerDTO;
import com.crowdcoding.dto.CommentDTO;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.DebugDTO;
import com.crowdcoding.entities.Answer;
import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.Comment;
import com.crowdcoding.entities.Function;
import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.Question;
import com.crowdcoding.dto.QuestionDTO;
import com.crowdcoding.entities.Questioning;
import com.crowdcoding.entities.Test;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.servlets.CommandContext;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.LoadResult;

public abstract class QuestioningCommand extends Command
{
	protected long questioningId;
	protected String workerId;

	/* PUBLIC METHODS */
	public static QuestioningCommand createQuestion(String jsonDTOData, String workerId, String workerHandle){
		return new CreateQuestion(jsonDTOData, workerId, workerHandle);
	}
	
	public static QuestioningCommand createAnswer(String jsonDTOData, String workerId, String workerHandle){
		return new CreateAnswer(jsonDTOData, workerId, workerHandle);
	}
	
	public static QuestioningCommand createComment(String jsonDTOData, String workerId, String workerHandle){
		return new CreateComment(jsonDTOData, workerId, workerHandle);
	}
	
	public static QuestioningCommand addVote(long questioningId, String workerId){
		return new AddVote(questioningId, workerId);
	}
	
	public static QuestioningCommand removeVote(long questioningId, String workerId){
		return new RemoveVote(questioningId, workerId);
	}
	
	public static QuestioningCommand addReport(long questioningId, String workerId){
		return new AddReport(questioningId, workerId);
	}
	
	public static QuestioningCommand removeReport(long questioningId, String workerId){
		return new RemoveReport(questioningId, workerId);
	}

	public static QuestioningCommand notifySubscribers(long questioningId, String message, String excludedWorkerId){
		return new NotifySubscribers(questioningId,message,excludedWorkerId);
	}
	
	private QuestioningCommand(long questioningId, String workerId) {
		this.questioningId = questioningId;
		this.workerId = workerId;
		queueCommand(this);
	}
	// All constructors for TestCommand MUST call queueCommand and the end of
	// the constructor to add the
	// command to the queue.
	private static void queueCommand(Command command) {
		CommandContext.ctx.addCommand(command);
	}

	public void execute(String projectId) {
		if (questioningId != 0) {
			LoadResult<Questioning> questioningRef = find(questioningId);

			if (questioningRef == null)
				System.out
						.println("Cannot execute QuestiongCommand. Could not Questioning test for questioningId "
								+ questioningId);
			else {
				Questioning questioning = questioningRef.now();
				execute(questioning, projectId);
			}
		} else
			execute(null, projectId);
	}

	public abstract void execute(Questioning questioning, String projectId);

	// Finds the specified microtask. Returns null if no such microtask exists.
	protected LoadResult<Questioning> find(long questioningId)
	{

		return (LoadResult<Questioning>) ofy().load().key(Questioning.getKey(questioningId));

	}


	protected static class CreateQuestion extends QuestioningCommand {
		private String jsonDTOData;
		private String workerHandle;

		public CreateQuestion(String jsonDTOData, String ownerId, String ownerHandle) {
			super(0L, ownerId);
			this.jsonDTOData= jsonDTOData;
			this.workerHandle = ownerHandle;
		}

		public void execute(Questioning questioning, String projectId) {

			QuestionDTO dto=null;
			try {
				System.out.println(jsonDTOData);
				dto = (QuestionDTO)DTO.read(jsonDTOData, QuestionDTO.class);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			Question question = new Question(dto.title, dto.text, dto.tags, dto.artifactId, workerId, workerHandle, projectId);
		}
	}

	protected static class CreateAnswer extends QuestioningCommand {
		private String jsonDTOData;
		private String workerHandle;

		public CreateAnswer(String jsonDTOData, String ownerId, String ownerHandle) {
			super(0L, ownerId);
			this.jsonDTOData=jsonDTOData;
			this.workerHandle = ownerHandle;
		}

		public void execute(Questioning questioning, String projectId) {

			AnswerDTO dto = null;
			try {
				dto = (AnswerDTO)DTO.read(jsonDTOData, AnswerDTO.class);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			Answer answer = new Answer(dto.text, dto.questionId, workerId, workerHandle, projectId);
		}
	}

	protected static class CreateComment extends QuestioningCommand {
		private String jsonDTOData;
		private String workerHandle;

		public CreateComment(String jsonDTOData, String ownerId, String ownerHandle) {
			super(0L, ownerId);
			this.jsonDTOData=jsonDTOData;
			this.workerHandle = ownerHandle;

		}

		public void execute(Questioning questioning, String projectId) {

			CommentDTO dto = null;
			try {
				dto = (CommentDTO)DTO.read(jsonDTOData, CommentDTO.class);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			Comment comment = new Comment(dto.text, dto.questionId, dto.answerId, workerId, workerHandle, projectId);
		}
	}

	protected static class AddVote extends QuestioningCommand {

		public AddVote(long questioningId, String workerId) {
			super(questioningId, workerId);
		}

		public void execute(Questioning questioning, String projectId) {

			questioning.addVote(workerId);
		}
	}

	protected static class RemoveVote extends QuestioningCommand {

		public RemoveVote(long questioningId, String workerId) {
			super(questioningId, workerId);
		}

		public void execute(Questioning questioning, String projectId) {

			questioning.removeVote(workerId);
		}
	}
	protected static class AddReport extends QuestioningCommand {

		public AddReport(long questioningId, String workerId) {
			super(questioningId, workerId);
		}

		public void execute(Questioning questioning, String projectId) {

			questioning.addReport(workerId);
		}
	}

	protected static class RemoveReport extends QuestioningCommand {

		public RemoveReport(long questioningId, String workerId) {
			super(questioningId, workerId);
		}

		public void execute(Questioning questioning, String projectId) {

			questioning.removeReport(workerId);
		}
	}
	


	protected static class NotifySubscribers extends QuestioningCommand {

		private String message; 
		
		public NotifySubscribers(long questioningId, String message, String excludedWorkerId) {
			super(questioningId, excludedWorkerId);
			this.message = message;
		}

		public void execute(Questioning questioning, String projectId) {

			questioning.notifySubscribers(message, workerId);
		}
	}

}
