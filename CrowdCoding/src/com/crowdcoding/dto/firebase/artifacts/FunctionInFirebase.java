package com.crowdcoding.dto.firebase.artifacts;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.ajax.microtask.submission.FunctionParameterDTO;

public class FunctionInFirebase extends DTO
{
	public String messageType = "FunctionInFirebase";
	public String name;
	public long id;
	public int version;
	public String returnType;
	public List<FunctionParameterDTO> parameters = new ArrayList<FunctionParameterDTO>();
	public String header;
	public String description;
	public String code;
	public int linesOfCode;
	public List<Long> ADTsId;
	public List<Long> calleesId;
	public boolean isReadOnly;
	public boolean isApiArtifact;
	public boolean isDeleted;

	// Description includes all comments and the signature block itself. e.g.,
	// // A description of foo, describing what it does and its parameters and return value.

	// Header consists of the header: e.g.,
	// function foo(arg1, arg2)

	// Default constructor (required by Jackson JSON library)
	public FunctionInFirebase()
	{
	}

	public FunctionInFirebase(String name, long id, int version, String returnType, List<String> paramNames,
			List<String> paramTypes,List<String> paramDescriptions, String header, String description, String code, int linesOfCode,
			List<Long> ADTsId, List<Long> calleesId, boolean isReadOnly, boolean isApiArtifact, boolean isDeleted )
	{
		this.name 		 = name;
		this.id 		 = id;
		this.version 	 = version;
		this.returnType  = returnType;
		this.header 	 = header;
		this.description = description;
		this.code 		 = code;
		this.linesOfCode = linesOfCode;

		// creates the parameters List
		for(int i=0; i< paramNames.size(); i++){
			this.parameters.add(
				new FunctionParameterDTO(paramNames.get(i), paramTypes.get(i), paramDescriptions.get(i)));
		}


		this.ADTsId		   = ADTsId;
		this.calleesId 	   = calleesId;
		this.isApiArtifact = isApiArtifact;
		this.isDeleted     = isDeleted;


	}
}
