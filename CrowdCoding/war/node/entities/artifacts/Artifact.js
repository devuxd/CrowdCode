export class Artifact {
    constructor (isAPIArtifact, isReadOnly, projectId) {
        this.isAPIArtifact = isAPIArtifact;
        this.isReadOnly	   = isReadOnly;
        this._isDeleted     = false;
        this.version       = 0;
        this.projectId     = projectId;

        this.paramNames = {};
        this.paramTypes = {};
        this.paramDescriptions = {};

        if (this._id == null) {
            this._id = 0;
        } else {
            this._id++;
        }

    }

    get id() {
        return this._id;
    }

    deleteArtifact() {
        if (!(this.isAPIArtifact)) {
            this._isDeleted = true;
        }
    }

    unDeleteArtifact() {
        this._isDeleted = false;
    }

    get isDeleted() {
        return this._isDeleted;
    }

    getArtifactType() {
        // return this.getClass().getSimpleName();
    }

    getName() {
        throw "Must implement getName().";
    }

    storeToFirebase(projectId) {
        throw "Must implement storeToFirebase()";
    }
    
    incrementVersion() {
        version++;
        // ofy().save().entity(this).now(); ???
    }
}