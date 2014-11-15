package com.crowdcoding.history;

import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

import com.crowdcoding.util.Pair;

/* HistoryLogs capture the events that occur during a session. As they only persist for the life
 * of a session, they are not stored in the DataStore. A HistoryLog consists of a tree of events.
 * Calling beginEvent begins a list of entries that are the child of the previously active entry.
 * 
 * Note: there must be a single root event. All events may have multiple children.
 */
public class HistoryLog 
{
	private EventNode root;
	private Stack<EventNode> eventStack = new Stack<EventNode>();
	
	public class EventNode
	{
		public List<EventNode> children = new ArrayList<EventNode>();
		public HistoryEvent event;
		
		public EventNode(HistoryEvent event)
		{
			this.event = event;
		}
	}
	
	public void beginEvent(HistoryEvent event)
	{
		EventNode node = new EventNode(event);
		if (root == null)
			root = node;

		// If we are not at the bottom of the stack, add this node as a child of the top of the stack 
		if (!eventStack.isEmpty())		
		{
			EventNode parent = eventStack.peek();
			node.event.parentID = parent.event.generateID();
			parent.children.add(node);
		}
		
		eventStack.push(node);
	}
		
	public void endEvent()
	{
		eventStack.pop();		
	}	
	
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