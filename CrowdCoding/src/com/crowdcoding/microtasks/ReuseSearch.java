package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.artifacts.Function;
import com.crowdcoding.artifacts.Project;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ReusedFunctionDTO;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class ReuseSearch extends Microtask 
{
	@Load private Ref<Function> function;
	private String callDescription;
		
	// Default constructor for deserialization
	private ReuseSearch() 
	{				
	}
	
	// Constructor for initial construction
	public ReuseSearch(Function function, String callDescription, Project project)
	{
		super(project);
		this.function = (Ref<Function>) Ref.create(function.getKey());		
		this.callDescription = callDescription;
		ofy().save().entity(this).now();
	}
	
	protected void doSubmitWork(DTO dto, Project project)
	{
		function.get().reuseSearchCompleted((ReusedFunctionDTO) dto, callDescription, project);	
	}
	
	protected Class getDTOClass()
	{
		return ReusedFunctionDTO.class;
	}
	
	public String getUIURL()
	{
		return "/html/ReuseSearch.jsp";
	}
	
	public String getCallDescription()
	{
		return callDescription;
	}
}
