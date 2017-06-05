var admin = require("./firebase-admin-sdk");

module.exports = {
  // retrieve user by uid
  // return promise
  getUserById: function(uid) {
    return admin.auth().getUser(uid);
  },
  // retrieve user by email
  // return promise
  getUserByEmail: function(email) {
    return admin.auth().getUserByEmail(email);
  },
  // update user
  // return promise
  updateUser: function(uid, userObject) {
    return admin.auth().updateUser(uid, {
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
    return admin.auth().deleteUser(uid);

  }
};
