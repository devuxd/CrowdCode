package com.crowdcoding.entities.microtasks;

import static com.googlecode.objectify.ObjectifyService.ofy;

import java.io.IOException;
import java.util.logging.Logger;

import com.crowdcoding.commands.MicrotaskCommand;
import com.crowdcoding.commands.ProjectCommand;
import com.crowdcoding.commands.WorkerCommand;
import com.crowdcoding.dto.DTO;
import com.crowdcoding.dto.firebase.microtasks.*;
import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.artifacts.Artifact;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.history.MicrotaskSkipped;
import com.crowdcoding.history.MicrotaskSubmitted;
import com.crowdcoding.util.FirebaseService;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.google.appengine.labs.repackaged.org.json.JSONArray;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.LoadResult;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;
import com.googlecode.objectify.annotation.Parent;

/*
 * NOTE: The Microtask class is abstract and SHOULD NOT be instantiated, except for internally inside objectify
 * which needs to instantiate them to register subclasses.
 */
@Entity
class Microtask
{
	function keyToString(key){
		var keyString = null;
		if( key != null )
			keyString = key.getParent().getId()+"-"+key.getId();
		return keyString;
	}
	function stringToKey(key){
		/*Key<Microtask> keyObj = null; 
		if( !( key == null || key.length() == 0) ){
			String[] ids = key.split("-");
			Key<Artifact> parentKey = Key.create(Artifact.class, Long.parseLong(ids[0]) );
			keyObj = Key.create(parentKey,Microtask.class, Long.parseLong(ids[1]));
		}*/ //replace with obj collection
		return keyObj;
	}

	var = 10;

	@Id protected Long id;
	@Index String projectId;

	var assigned = false;
	var completed = false;
	var queued    = false;
	var reissuedFrom = "";
	var submitValue = DEFAULT_SUBMIT_VALUE;
	var assignmentTimeInMillis;	// time when worker is assigned microtask, in milliseconds
	var workerId;
	var functionId;

	function getWorkerId() {
		return workerId;
	}

	function getFunctionId() {
		return functionId;
	}

	function setWorkerId(workerId) {
		this.workerId = workerId;
		ofy().save().entity(this).now(); 
	}

	// Default constructor for deserialization
	constructor()
	{
	}

	// Constructor for initialization. Microtask is set as ready.
	constructor (projectId, functionId)
	{
		this.workerId = null;
		this.projectId = projectId;
		this.projectId  = projectId;
		this.functionId = functionId;

	}

	// Creates a copy of this microtask, identical in all respects except with a new microtaskID
	// and with a reset completed and assignmentTime. The microtask is NOT queued onto the project work queue.
	// This method MUST be overridden in the subclass
	function copy(projectId)
	{
		console.log("COPYING TASK "+this);
		throw new RuntimeException("Error - must implement in subclass!");
	}

	// Override this method to allow the microtask to decide, right before it is assigned,
	// if it is still needed
	function isStillNeeded(project) { return true; }

	function submit(jsonDTOData, workerID, awardedPoint)
	{
		// If this microtask has already been completed, drop it, and clear the worker from the microtask
		// TODO: move this check to the project, as this check will be too late for work creating review microtasks.
		if (this.completed){
			return;
		}

		try {
			DTO dto = DTO.read(jsonDTOData, getDTOClass());

			doSubmitWork(dto, workerID);

			this.completed = true;
			ofy().save().entity(this).now();

			// increase the stats counter
			WorkerCommand.increaseStat(workerID, "microtasks",1);
			WorkerCommand.awardPoints(workerID, awardedPoint);
			// write completed on firebase
			FirebaseService.writeMicrotaskCompleted( Microtask.keyToString(this.getKey()), workerID, projectId, this.completed);

		} catch( JsonParseException e) {
			e.printStackTrace();
		} catch( JsonMappingException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}


	}

	function revise (jsonDTOData, excludedWorkerID, awardedPoint, reissueMotivation, projectId)
	{
		// If this microtask has already been completed, drop it, and clear the worker from the microtask
		// TODO: move this check to the project, as this check will be too late for work creating review microtasks.
		if (this.completed){
			Logger.getLogger("LOGGER").severe("MICROTASK ALREADY COMPLETED: "+this.toString());
			return;
		}
		this.completed = true;
		ofy().save().entity(this).now();

		//copy the microtask
		Microtask newMicrotask = this.copy(projectId);
		Key<Microtask> a = ofy().save().entity(newMicrotask).now();
		String microtaskKey = Microtask.keyToString(newMicrotask.getKey());

		String reissuedFromMicrotaskKey = Microtask.keyToString(this.getKey());
		//enqueu the microtask
		ProjectCommand.queueMicrotask(newMicrotask.getKey(), excludedWorkerID);
		WorkerCommand.awardPoints( excludedWorkerID ,awardedPoint );

		//write the reissue field on the new microtask
		FirebaseService.writeMicrotaskReissuedFrom(microtaskKey, new ReissueInFirebase(reissuedFromMicrotaskKey, reissueMotivation), jsonDTOData,  projectId );
		// write completed on firebase
		FirebaseService.writeMicrotaskCompleted( Microtask.keyToString(this.getKey()), excludedWorkerID, projectId, this.completed);


	}

	function skip(workerID, disablePoint, projectId)
	{
		if(! disablePoint){
		// Increment the point value by 10
			this.submitValue *= 1.2;
		}
		this.workerId = "";
		ofy().save().entity(this).now();
		FirebaseService.writeMicrotaskPoints(Microtask.keyToString(this.getKey()), this.submitValue, projectId);
		HistoryLog.Init(projectId).addEvent(new MicrotaskSkipped(this, workerID));
	}


	function getKey()
	{
		throw new RuntimeException("Error - must implement in subclass!");
	}

	function getID()
	{
		return id;
	}

	// returns the relative path to the UI for this microtask
	function getUIURL() { return ""; }

	// This method MUST be overridden in the subclass to do submit work.
	function doSubmitWork(dto, workerID)
	{
		throw new RuntimeException("Error - must implement in subclass!");
	}

	// This method MUST be overridden in the subclass
	function getDTOClass()
	{
		throw new RuntimeException("Error - must implement in subclass!");
	}

	// This method MUST be overridden in the subclass to provide the owning artifact.
	// The owning artifact is the artifact that will be modified by this microtask. If multiple artifacts
	// may be modified, the owning artifact is null.
	function getOwningArtifact()
	{
		throw new RuntimeException("Error - must implement in subclass!");
	}

	// This method MUST be overridden in the subclass to provide the name of the microtask.
	function microtaskTitle()
	{
		throw new RuntimeException("Error - must implement in subclass!");
	}

	// This method MUST be overridden in the subclass to provide the name of the microtask.
	function microtaskDescription()
	{
		throw new RuntimeException("Error - must implement in subclass!");
	}

	function microtaskName()
	{
		// Get the name of the runtime microtask instance (e.g., ReuseSearch)
		return this.getClass().getSimpleName();
	}

	function assignmentTimeInMillis()
	{
		return assignmentTimeInMillis;
	}
	function setReissuedFrom(String microtaskKey)
	{
		this.reissuedFrom=microtaskKey;
	}
	function getSubmitValue()
	{
		return submitValue;
	}

	// Should only be called from within the entity group of the owning artifact
	function LoadResult<Microtask> find(Key<Microtask> microtaskKey)
	{
		return (LoadResult<Microtask>) ofy().load().key(microtaskKey);
	}

	fucntion toJSON(){
		return toJSON(new JSONObject());
	}

	function toJSON(JSONObject json){
		try {
			json.put("key", Microtask.keyToString(this.getKey()));
			json.put("id", this.id);
			json.put("type", this.microtaskName());
			json.put("description", this.microtaskDescription());
			json.put("title", this.microtaskTitle());
			json.put("submitValue", this.getSubmitValue());
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return json.toString();
	}

	function isAssignedTo(String workerId){
		if(this.getWorkerId()!=null && this.getWorkerId().isEmpty())
			return true;

		boolean isAssigned= this.getWorkerId() != null && this.getWorkerId().equals( workerId );

		return isAssigned;
	}
}