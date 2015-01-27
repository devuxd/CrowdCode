package com.crowdcoding.history;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Stack;

import com.crowdcoding.util.FirebaseService;
import com.crowdcoding.util.Pair;
import com.google.appengine.api.urlfetch.HTTPMethod;

/* HistoryLogs capture the events that occur during a session. As they only persist for the life
 * of a session, they are not stored in the DataStore. A HistoryLog consists of a tree of events.
 * Calling beginEvent begins a list of entries that are the child of the previously active entry.
 *
 * Note: there must be a single root event. All events may have multiple children.
 */
public class HistoryLog
{
	private static HistoryLog historyLog = null;
	private EventNode root;
	private LinkedList<EventNode> eventList = new LinkedList<EventNode>();
	private String projectId = "";

	public HistoryLog(){
		//System.out.println("== NEW HISTORY LOG");
	}

	public static HistoryLog Init(String projectId){
		if( historyLog == null ){
			historyLog = new HistoryLog(projectId);
		}
		return historyLog;
	}

	public HistoryLog(String projectId) {
		this.projectId = projectId;
	}

	public void addEvent(HistoryEvent event){
		EventNode node = new EventNode(event);
		eventList.add(node);
	}

	public void publish(){

		while(!eventList.isEmpty()){
			EventNode node = eventList.pop();
			FirebaseService.publishHistoryLogEvent(node.event, projectId);
		}
	}

	public class EventNode
	{
		public List<EventNode> children = new ArrayList<EventNode>();
		public HistoryEvent event;

		public EventNode(HistoryEvent event)
		{
			this.event = event;
		}
	}
	/*
	public void beginEvent(HistoryEvent event)
	{
		EventNode node = new EventNode(event);
		if (root == null){
			root = node;
		}else{
			EventNode parent = root;
			node.event.parentID = root.event.generateID();
			root.children.add(node);
		}


//		// If we are not at the bottom of the stack, add this node as a child of the top of the stack
//		if (!eventStack.isEmpty())
//		{
//			EventNode parent = eventStack.peek();
//			node.event.parentID = parent.event.generateID();
//			parent.children.add(node);
//		}

		eventStack.push(node);
		//System.out.println("---OPEN "+event.generateID());
	}

	public void endEvent()
	{
		EventNode pop = eventStack.pop();

		//System.out.println("---CLOSE "+pop.event.generateID());
	}
	*/
	// Gets a representation as a list of pairs - a string event ID and a JSON string - capturing each
	// event in the log.
	public List<Pair<String, String>> json()
	{
		List<Pair<String, String>> json = new ArrayList<Pair<String, String>>();

		// Do an in-order traversal of the tree - first visit the parent, then each child (recursively).
		if (root != null)
		{
			Stack<EventNode> traversalStack = new Stack<EventNode>();
			traversalStack.push(root);
			while(!traversalStack.isEmpty())
			{
				// Visit the top of the stack. Then add any children in reverse order, to preserve ordering.
				EventNode node = traversalStack.pop();
				json.add(new Pair<String, String>(node.event.generateID(), node.event.json()));
				for (int i = node.children.size() - 1; i >= 0; i--)
					traversalStack.push(node.children.get(i));
			}
		}

		return json;
	}
}
