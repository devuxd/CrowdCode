package com.crowdcoding.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.artifacts.Entrypoint;
import com.crowdcoding.artifacts.Project;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.EntrypointDTO;
import com.crowdcoding.dto.FunctionDescriptionDTO;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.EntitySubclass;
import com.googlecode.objectify.annotation.Load;

@EntitySubclass(index=true)
public class WriteEntrypoint extends Microtask 
{
	 @Load private Ref<Entrypoint> entrypoint;
		
	// Default constructor for deserialization
	private WriteEntrypoint()
	{		
	}
	
	// Constructor for initial construction
	public WriteEntrypoint(Entrypoint entrypoint, Project project)
	{
		super(project);
		this.entrypoint = (Ref<Entrypoint>) Ref.create(entrypoint.getKey());		
		ofy().save().entity(this).now();
	}
	
	protected void doSubmitWork(DTO dto, Project project)
	{
		entrypoint.get().setInitial((FunctionDescriptionDTO) dto, project);	
	}
	
	protected Class getDTOClass()
	{
		return EntrypointDTO.class;
	}		
	
	public String getUIURL()
	{
		return "/html/entrypoints.jsp";
	}	
	
	public Entrypoint getEntrypoint()
	{
		return entrypoint.get();
	}
}
