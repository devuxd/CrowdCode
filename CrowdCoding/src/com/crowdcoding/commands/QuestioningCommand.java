package com.crowdcoding.commands;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;

import com.crowdcoding.dto.DTO;
import com.crowdcoding.entities.Answer;
import com.crowdcoding.entities.Artifact;
import com.crowdcoding.entities.Comment;
import com.crowdcoding.entities.Function;
import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.Question;
import com.crowdcoding.entities.Worker;
import com.crowdcoding.dto.ajax.microtask.submission.DebugDTO;
import com.crowdcoding.dto.ajax.questions.AnswerDTO;
import com.crowdcoding.dto.ajax.questions.CommentDTO;
import com.crowdcoding.dto.ajax.questions.QuestionDTO;
import com.crowdcoding.dto.firebase.notification.NotificationInFirebase;
import com.crowdcoding.entities.Questioning;
import com.crowdcoding.entities.Test;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.history.PropertyChange;
import com.crowdcoding.history.QuestionViewed;
import com.crowdcoding.servlets.ThreadContext;
import com.crowdcoding.util.FirebaseService;
import com.google.appengine.api.datastore.QueryResultIterator;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.LoadResult;
import com.googlecode.objectify.VoidWork;

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

	public static QuestioningCommand incrementQuestionAnswers(long questionId){
		return new IncrementQuestionAnswers(questionId);
	}

	public static QuestioningCommand incrementQuestionComments(long questionId){
		return new IncrementQuestionComments(questionId);
	}

	public static QuestioningCommand addQuestionView(long questionId, String workerId) {
		return new AddQuestionView(questionId,workerId);
	}

	public static QuestioningCommand updateQuestion(long questionId, String jsonDTO, String workerId) {
		return new UpdateQuestion(questionId,jsonDTO,workerId);
	}

	public static QuestioningCommand vote(long questioningId, String workerId, boolean remove){
		return new Vote(questioningId, workerId, remove);
	}

	public static QuestioningCommand report(long questioningId, String workerId, boolean remove){
		return new Report(questioningId, workerId, remove);
	}

	public static QuestioningCommand linkArtifact(long questioningId, String artifactId, boolean remove ){
		return new LinkArtifact(questioningId, artifactId, remove);
	}

	public static QuestioningCommand subscribeWorker(long questioningId, String workerId, boolean remove){
		return new SubscribeWorker(questioningId, workerId, remove);
	}

	public static QuestioningCommand notifySubscribers(long questioningId, NotificationInFirebase notification, String excludedWorkerId){
		return new NotifySubscribers(questioningId,notification,excludedWorkerId);
	}

	public static QuestioningCommand setClosed(long questioningId, boolean closed){
		return new SetClosed(questioningId,closed);
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
		ThreadContext threadContext = ThreadContext.get();
        threadContext.addCommand(command);
	//	CommandContext.ctx.addCommand(command);
	}

	public void execute(final String projectId) {
	        	if (questioningId != 0) {
	    			LoadResult<Questioning> questioningRef = find(questioningId);

	    			if (questioningRef == null)
	    				System.out
	    						.println("errore Cannot execute QuestiongCommand. Could not Questioning test for questioningId "
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
				dto = (QuestionDTO) DTO.read(jsonDTOData, QuestionDTO.class);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			new Question(dto.title, dto.text, dto.tags, dto.artifactId, workerId, workerHandle, projectId);
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
				Answer answer = new Answer(dto.text, dto.questionId, workerId, workerHandle, projectId);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
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
				Comment comment = new Comment(dto.text, dto.questionId, dto.answerId, workerId, workerHandle, projectId);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}

	protected static class UpdateQuestion extends QuestioningCommand {
		private String jsonDTO;

		public UpdateQuestion(long questionId, String dto, String workerId) {
			super(questionId, workerId);
			this.jsonDTO = dto;
		}

		public void execute(Questioning questioning, String projectId) {

			Question question = (Question) questioning;
			QuestionDTO dto=null;
			try {
				dto = (QuestionDTO) DTO.read(jsonDTO, QuestionDTO.class);
				question.setTitle(dto.title);
				question.setText(dto.text);
				question.setTags(dto.tags);
				question.save();
				question.storeVersionToFirebase();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

		}
	}


	protected static class AddQuestionView extends QuestioningCommand {

		private long questionId;
		public AddQuestionView(long questionId, String workerId) {
			super(0L,workerId);
			this.questionId = questionId;
		}

		public void execute(Questioning questioning, String projectId) {
			HistoryLog.Init(projectId).addEvent(new QuestionViewed(questionId,workerId,projectId));
		}
	}

	protected static class IncrementQuestionAnswers extends QuestioningCommand {

		public IncrementQuestionAnswers(long questionId) {
			super(questionId, "");
		}

		public void execute(Questioning questioning, String projectId) {

			Question question = (Question) questioning;
			question.incrementAnswers();
			question.save();
		}
	}

	protected static class IncrementQuestionComments extends QuestioningCommand {

		public IncrementQuestionComments(long questionId) {
			super(questionId, "");
		}

		public void execute(Questioning questioning, String projectId) {

			Question question = (Question) questioning;
			question.incrementComments();
			question.save();
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
			this.remove     = remove;
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



	protected static class NotifySubscribers extends QuestioningCommand {


		private NotificationInFirebase notification;

		public NotifySubscribers(long questioningId, NotificationInFirebase notification, String workerId) {
			super(questioningId, workerId);
			this.notification = notification;
		}

		public void execute(Questioning questioning, String projectId) {
			questioning.notifySubscribers(notification, workerId);
		}
	}

	protected static class SetClosed extends QuestioningCommand {

		private boolean closed;

		public SetClosed(long questioningId, boolean closed) {
			super(questioningId,"");
			this.closed = closed;
		}

		public void execute(Questioning questioning, String projectId) {
			Question question = (Question) questioning;
			question.setClosed(closed);
		}

	}

}
