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

    buyProduct() {

    }
}