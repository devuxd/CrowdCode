package com.crowdcoding.entities;

import com.google.appengine.api.datastore.Blob;
import com.google.appengine.api.users.User;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
@Entity

public class UserPicture {
	@Id private String userId;

    Blob image;

    public UserPicture() { }
    public UserPicture(String userId, Blob image) {
        this.userId = userId;
        this.image  = image;
    }
    public UserPicture(String userId) {
        this.userId = userId;
    }

    public Blob getImage()              { return image; }
    public void setImage(Blob image)    { this.image = image; }
}
