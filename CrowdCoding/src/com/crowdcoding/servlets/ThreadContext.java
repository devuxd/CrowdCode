
	package com.crowdcoding.servlets;

	import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

	import com.crowdcoding.commands.Command;
import com.crowdcoding.entities.Project;
import com.crowdcoding.history.HistoryLog.EventNode;
import com.crowdcoding.util.FirebaseService;
import com.crowdcoding.util.FirebaseService.FirebaseWrite;

	public class ThreadContext {

		private Queue<Command> commandsList							    = new LinkedList<Command>();
		private ConcurrentLinkedQueue<FirebaseWrite> firebaseWritesList = new ConcurrentLinkedQueue<FirebaseWrite>();
		private ConcurrentLinkedQueue<EventNode> eventList = new ConcurrentLinkedQueue<EventNode>();

		private String jsonResponse;

	    private static ThreadLocal<ThreadContext> threadLocal = new ThreadLocal<ThreadContext>(){
	        @Override
	        protected ThreadContext initialValue() {
	            return new ThreadContext();
	        }

	    };
	    public static ThreadContext get() {
	        return threadLocal.get();
	    }

	    public void reset() {
	    	commandsList = new LinkedList<Command>();
			firebaseWritesList =  new ConcurrentLinkedQueue<FirebaseWrite>();
	    }

	    public void addCommand(Command command) {
	    	this.commandsList.add(command);
		}

	    public Queue<Command> getCommands() {
			return commandsList;
		}

	    public void addfirebaseWrite(FirebaseWrite firebaseWrite) {
	    	this.firebaseWritesList.add(firebaseWrite);
		}

	    public ConcurrentLinkedQueue<FirebaseWrite> getFirebaseWritesList() {
			return firebaseWritesList;
		}
	    public void addEventList(EventNode eventNode) {
	    	this.eventList.add(eventNode);
		}

	    public ConcurrentLinkedQueue<EventNode> getEventList() {
			return eventList;
		}

	    public String getJsonResponse() {
			return jsonResponse;
		}

		public void setJsonResponse(String jsonResponse) {
			this.jsonResponse = jsonResponse;
		}

	}