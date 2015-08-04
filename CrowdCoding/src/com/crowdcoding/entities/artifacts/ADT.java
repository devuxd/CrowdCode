package com.crowdcoding.entities.artifacts;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import sun.security.krb5.internal.crypto.DesCbcCrcEType;

import com.crowdcoding.commands.FunctionCommand;
import com.crowdcoding.commands.MicrotaskCommand;
import com.crowdcoding.dto.firebase.artifacts.ADTInFirebase;
import com.crowdcoding.dto.firebase.artifacts.AdvancedTestInFirebase;
import com.crowdcoding.entities.microtasks.Microtask;
import com.crowdcoding.history.ArtifactCreated;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.history.PropertyChange;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Subclass;
import com.googlecode.objectify.annotation.Index;

@Subclass(index=true)
public class ADT extends Artifact
{

	private String description;
	private String name;

	// Hash Map that describe the ADT Structure in the form "field Name", "Field type"
	private HashMap<String, String> structure = new HashMap<String,String>();

	private HashMap<String, String> examples = new HashMap<String,String>();

	//functions that currently use the ADT
	private List<Long> functionsId;


	/******************************************************************************************
	 * Constructor
	 *****************************************************************************************/

	// Constructor for deserialization
	protected ADT()
	{
	}

	public ADT(String description, String name, HashMap<String,String> structure, HashMap<String,String> examples,boolean isApiArtifact, boolean isReadOnly, String projectId)
	{
		super(isApiArtifact, isReadOnly, projectId);
		this.name		 = name;
		this.description = description;
		this.structure	 = structure;
		this.examples 	 = examples;
		ofy().save().entity(this).now();

		storeToFirebase();

		HistoryLog.Init(projectId).addEvent(new ArtifactCreated( this ));
	}

	/******************************************************************************************
	 * Accessors
	 *****************************************************************************************/

	public String getDescription()
	{
		return description;
	}

	public String getName()
	{
		return name;
	}


	/******************************************************************************************
	 * Commands
	 *****************************************************************************************/

	// Marks this test as deleted, removing it from the list of tests on its owning function.
	public void delete()
	{
		this.isDeleted = true;
		ofy().save().entity(this).now();
		storeToFirebase(projectId);
        HistoryLog.Init(projectId).addEvent(new PropertyChange("isDeleted", "true", this));


	}

	public void update(String description, String name, HashMap<String, String> structure)
	{
		this.description = description;
		this.name		 = name;
		this.structure	 = structure;
		ofy().save().entity(this).now();
		storeToFirebase();

	}

	public void addFunction(long functionId)
	{
		this.functionsId.add(functionId);
		ofy().save().entity(this).now();
	}

	public void removeFunction(long functionId)
	{
		this.functionsId.remove(functionId);
		ofy().save().entity(this).now();
	}

	/******************************************************************************************
	 * Firebase methods
	 *****************************************************************************************/

	public void storeToFirebase()
	{
		int firebaseVersion = version + 1;

		FirebaseService.writeADT(new ADTInFirebase(
										this.id,
										firebaseVersion,
										description,
										name,
										structure,
										examples,
										isReadOnly,
										isAPIArtifact,
										isDeleted),
									this.id,
									firebaseVersion,
									projectId);

		incrementVersion();
	}

	/******************************************************************************************
	 * Objectify Datastore methods
	 *****************************************************************************************/

	// Given a ref to a function that has not been loaded from the datastore,
	// load it and get the object
	public static ADT load(Ref<ADT> ref)
	{
		return ofy().load().ref(ref).now();
	}

	// Given an id for a test, finds the corresponding test. Returns null if no such test exists.
	public static ADT find(long id)
	{
		return (ADT) ofy().load().key(Artifact.getKey(id)).now();
	}

}
