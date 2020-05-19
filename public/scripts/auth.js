const AUTHSTATE_AUTHENTICATED = 'authenticated';
const AUTHSTATE_NOT_AUTHENTICATED = 'not-authenticated';
const AUTHSTATE_ACCESS_REQUESTED = 'access-requested';

class Account {
    fullName = "";
    displayName = "";
    email = "";
    account = null;
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
    account = null;

    constructor(authenticatedCallback) {
        let t = this;
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // User authenticated, retrieve authorization (account exists?)
                t.getAccount(user).then((account) => {
                    if (account) {
                        console.log('Account exists');
                        this.account = account;
                        authenticatedCallback(AUTHSTATE_AUTHENTICATED);
                    } else {
                        console.log('Account does not exist, creating');
                        t.createAccount(t.user).then(() => authenticatedCallback(AUTHSTATE_ACCESS_REQUESTED));
                    }
                }).catch(logError);
            } else {
                t.account = null;
                authenticatedCallback(AUTHSTATE_NOT_AUTHENTICATED);
            }
        });
    }

    currentUser() {
        return firebase.auth().currentUser;
    }

    currentAccount() {
        return this.account;
    }

    createAccount(user) {
        if (typeof user.email !== "string" || user.email.length === 0) {
            throw "email should be non-empty string";
        }
        return firebase.firestore().collection('accounts').doc(user.email)
            .set({
                name: user.fullName,
                email: user.email,
                authorized: false
            })
            .catch(logError);
    }

    getAccount(user) {
        return firebase.firestore().collection('accounts').doc(user.email).get()
    }

    isAuthorized() {
        // TODO
        return this.isAuthenticated() && true;// this.user.authorized
    }

    isAuthenticated() {
        return this.currentUser() !== null;
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