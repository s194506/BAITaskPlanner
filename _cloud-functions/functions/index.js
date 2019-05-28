const functions = require('firebase-functions');
const admin = require('firebase-admin');


admin.initializeApp(functions.config().firebase);

exports.createCopyOfUserInFirestore = functions.auth.user().onCreate((user) => {
  return admin.firestore().collection('users').doc(user.uid).set({
    uid: user.uid,
    displayName: user.displayName || user.email,
    email: user.email,
    photoURL: user.photoURL,
  })
});

exports.deleteCopyOfUserFromFirestore = functions.auth.user().onDelete((user) => {
  return admin.firestore().collection('users').doc(user.uid).delete();
});