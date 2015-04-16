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
	public static QuestioningCommand createQuestion(String jsonDTOData, String workerId){
		return new CreateQuestion(jsonDTOData, workerId);
	}
	public static QuestioningCommand createAnswer(String jsonDTOData, String workerId){
		return new CreateAnswer(jsonDTOData, workerId);
	}
	public static QuestioningCommand createComment(String jsonDTOData, String workerId){
		return new CreateComment(jsonDTOData, workerId);
	}
	public static QuestioningCommand vote(long questioningId, String workerId, boolean remove){
		return new Vote(questioningId, workerId, remove);
	}
	public static QuestioningCommand report(long questioningId, String workerId, boolean remove){
		return new Report(questioningId, workerId, remove);
	}
	public static QuestioningCommand linkArtifact(long questioningId, String artifactId, boolean remove){
		return new LinkArtifact(questioningId, artifactId, remove);
	}
	public static QuestioningCommand subscribeWorker(long questioningId, String workerId, boolean remove){
		return new SubscribeWorker(questioningId, workerId, remove);
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

		public CreateQuestion(String jsonDTOData, String ownerId) {
			super(0L, ownerId);
			this.jsonDTOData= jsonDTOData;
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
			Question question = new Question(dto.title, dto.text, dto.tags, dto.artifactId, workerId, projectId);
		}
	}

	protected static class CreateAnswer extends QuestioningCommand {
		private String jsonDTOData;

		public CreateAnswer(String jsonDTOData, String ownerId) {
			super(0L, ownerId);
			this.jsonDTOData=jsonDTOData;
		}

		public void execute(Questioning questioning, String projectId) {

			AnswerDTO dto = null;
			try {
				dto = (AnswerDTO)DTO.read(jsonDTOData, AnswerDTO.class);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			Answer answer = new Answer(dto.text, dto.questionId, workerId, projectId);
		}
	}

	protected static class CreateComment extends QuestioningCommand {
		private String jsonDTOData;

		public CreateComment(String jsonDTOData, String ownerId) {
			super(0L, ownerId);
			this.jsonDTOData=jsonDTOData;

		}

		public void execute(Questioning questioning, String projectId) {

			CommentDTO dto = null;
			try {
				dto = (CommentDTO)DTO.read(jsonDTOData, CommentDTO.class);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			Comment comment = new Comment(dto.text, dto.questionId, dto.answerId, workerId, projectId);
		}
	}

	protected static class Vote extends QuestioningCommand {

		private boolean remove;

		public Vote(long questioningId, String workerId, boolean remove) {
			super(questioningId, workerId);
			this.remove=remove;

		}

		public void execute(Questioning questioning, String projectId) {

			if(this.remove)
				questioning.removeVote(workerId);
			else
				questioning.addVote(workerId);

		}
	}

	protected static class Report extends QuestioningCommand {

		private boolean remove;

		public Report(long questioningId, String workerId, boolean remove) {
			super(questioningId, workerId);
			this.remove=remove;

		}

		public void execute(Questioning questioning, String projectId) {

			if(this.remove)
				questioning.removeReport(workerId);
			else
				questioning.addReport(workerId);

		}
	}


	protected static class LinkArtifact extends QuestioningCommand {

		private boolean remove;
		private String artifactId;

		public LinkArtifact(long questioningId, String artifactId, boolean remove) {
			super(questioningId, "");
			this.artifactId = artifactId;
			this.remove=remove;
		}

		public void execute(Questioning questioning, String projectId) {
			if(this.remove)
				((Question)questioning).removeArtifactLink(artifactId);
			else
				((Question)questioning).addArtifactLink(artifactId);

		}
	}
	protected static class SubscribeWorker extends QuestioningCommand {

		private boolean remove;

		public SubscribeWorker(long questioningId, String workerId, boolean remove) {
			super(questioningId, workerId);
			this.remove=remove;
		}

		public void execute(Questioning questioning, String projectId) {
			if(this.remove)
				((Question)questioning).unsubscribeWorker(workerId);
			else
				((Question)questioning).subscribeWorker(workerId);

		}
	}

}
