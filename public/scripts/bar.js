class Product {
    constructor(id, name, price) {
        this.id = id;
        this.name = name;
        if (typeof price !== "number") {
            this.price = parseFloat(price);
        } else {
            this.price = price;
        }
    }
}

class Bar {

    constructor() {
        this.buyProductFn = firebase.functions().httpsCallable('buyProduct');
    }

    getProducts() {
        console.log('getting products');
        return firebase.firestore().collection('products').orderBy('name', 'asc')
            .get()
            .then((snap) => {
                let products = [];
                snap.forEach((doc) => products = products.concat(new Product(doc.id, doc.data().name, doc.data().price)));
                return products;
            })
            .catch(logError);
    }

    buyProduct(account, product) {
        if (typeof account.email !== "string") {
            throw "account email should be string";
        }
        if (!product.name) {
            throw "missing name";
        }
        if (isNaN(product.price)) {
            throw "missing price";
        }
        return this.buyProductFn({account: account.email, name: product.name, price: product.price})
    }
}