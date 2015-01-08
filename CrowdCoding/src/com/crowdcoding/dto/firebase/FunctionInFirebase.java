package com.crowdcoding.dto.firebase;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;

public class FunctionInFirebase extends DTO
{
	public String messageType = "FunctionInFirebase";

	public String name;
	public long id;
	public int version;
	public String returnType;
	public List<String> paramNames = new ArrayList<String>();
	public List<String> paramTypes = new ArrayList<String>();
	public List<String> paramDescriptions = new ArrayList<String>();
	public String header;
	public String description;
	public String code;
	public int linesOfCode;
	public boolean described;
	public boolean written;
	public boolean needsDebugging;
	public boolean readOnly;
	public int queuedMicrotasks;

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
			boolean described, boolean written, boolean needsDebugging, boolean readOnly, int queuedMicrotasks)
	{
		this.name = name;
		this.id = id;
		this.version = version;
		this.returnType = returnType;
		this.paramNames = paramNames;
		this.paramTypes = paramTypes;
		this.paramDescriptions = paramDescriptions;
		this.header = header;
		this.description = description;
		this.code = code;
		this.linesOfCode = linesOfCode;
		this.described = described;
		this.written = written;
		this.needsDebugging = needsDebugging;
		this.readOnly=readOnly;
		this.queuedMicrotasks = queuedMicrotasks;
	}

	public String toString()
	{
		return description + "\n" + header;
	}
}
