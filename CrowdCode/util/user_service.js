module.exports = function(AdminFirebase) {
  return {
    // retrieve user by uid
    // return promise
    getUserById: function(uid) {
      return AdminFirebase.auth().getUser(uid);
    },
    getUserByToken: function(idToken) {
      var self = this;
      return AdminFirebase.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
          var uid = decodedToken.uid;
          return self.getUserById(uid);
        }).catch(err => {
          console.log(err);
        });
    },
    // retrieve user by email
    // return promise
    getUserByEmail: function(email) {
      return AdminFirebase.auth().getUserByEmail(email);
    },
    // update user
    // return promise
    updateUser: function(uid, userObject) {
      return AdminFirebase.auth().updateUser(uid, {
        email: userObject.email,
        emailVerified: userObject.emailVerified,
        password: userObject.password,
        displayName: userObject.displayName,
        photoURL: userObject.photoURL,
        disabled: userObject.disabled
      });
    },
    // delete user
    // return promise
    deleteUser: function(uid) {
      return AdminFirebase.auth().deleteUser(uid);

    }
  };
}
