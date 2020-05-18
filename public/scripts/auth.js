const AUTHSTATE_AUTHENTICATED = 'authenticated';
const AUTHSTATE_NOT_AUTHENTICATED = 'not-authenticated';
const AUTHSTATE_ACCESS_REQUESTED = 'access-requested';


class User {
    fullName = "";
    displayName = "";
    email = "";
    authorized = false;

    constructor(fbUser, authorized) {
        if (!fbUser.displayName) {
            throw "displayName is empty"
        }
        if (!fbUser.email) {
            throw "displayName is empty"
        }
        this.fullName = fbUser.displayName;
        this.displayName = fbUser.displayName.split(' ')[0];
        this.email = fbUser.email;
        this.authorized = authorized;
    }
}

class AuthenticationContext {
    constructor(authenticatedCallback) {
        let t = this;
        if (firebase.auth().currentUser) {
            t.user = new User(firebase.auth().currentUser);
        } else {
            this.user = null;
        }
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                t.user = new User(firebase.auth().currentUser);
                // User authenticated, retrieve authorization (account exists?)
                t.userExists(t.user).then((exists) => {
                    if (exists) {
                        console.log('User exists');
                        authenticatedCallback(AUTHSTATE_AUTHENTICATED, user);
                    } else {
                        console.log('User does not exist, creating');
                        t.createUser(t.user).then(() => authenticatedCallback(AUTHSTATE_ACCESS_REQUESTED, user));
                    }
                });
            } else {
                t.user = null;
                authenticatedCallback(AUTHSTATE_NOT_AUTHENTICATED);
            }
        });
    }

    createUser(user) {
        return firebase.firestore().collection('users')
            .add({
                name: user.fullName,
                email: user.email,
                authorized: false
            })
            .catch(logError);
    }

    userExists(user) {
        return firebase.firestore().collection('users').where('email', '==', user.email)
            .get()
            .then((snap) => snap.size > 0)
            .catch(logError)
    }

    isAuthorized() {
        // TODO
        return this.isAuthenticated() && true;// this.user.authorized
    }

    isAuthenticated() {
        return this.user !== null;
    }

    authenticate() {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider);
    }

    logout() {
        let t = this;
        return firebase.auth().signOut()
            .then(() => {
                t.user = null;
                return true;
            })
            .catch(logError)
    }
}