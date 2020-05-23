const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.buyProduct = functions.https.onCall((data, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('failed-precondition', 'User is not authenticated.');
    }
    let consumptions = admin.firestore().collection('consumptions');
    data.forEach((line) => {
        if (typeof line.account !== "string") {
            throw new functions.https.HttpsError('invalid-argument', 'Missing/invalid account');
        }
        if (typeof line.name !== "string") {
            throw new functions.https.HttpsError('invalid-argument', 'Missing/invalid product name');
        }
        if (isNaN(line.price)) {
            throw new functions.https.HttpsError('invalid-argument', 'Missing/invalid product price');
        }
        console.log('Buying product: ' + line.name + " (price: " + line.price + ") for " + line.account);
        consumptions.add({
            account: line.account,
            name: line.name,
            price: line.price
        })
            .then(() => console.log("Bought " + line.name + " (price: " + line.price + ") for " + line.account))
            .catch((err) => { throw new functions.https.HttpsError('test/code', 'unable to buy product: ' + err) });
    });
});