var express = require('express');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var mysql = require('mysql')
var session = require('express-session');
const { calculateMac } = require('request/lib/hawk');

mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "node_project",

})

var app = express();

app.use(express.static('public'))
app.set('view engine', 'ejs');

app.listen(8080);
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));


function isProductInCart(cart, id) {
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id == id) {
            return true;
        }
    }

    return false;
}

function emptyCart(cart) {
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id == id) {
            cart.splice(cart.indexOf(i), 1);
        }
    }
}

function calculateTotal(cart, req) {
    total = 0
    
    for (let i = 0; i < cart.length; i++) {
        total = total + 1;
    }

    req.session.total = total;
    return total;
}

app.get('/', function(req, res) {
    var con = mysql.createConnection({
        host: "localhost",
        user: "seteam10",
        password: "QA87uEC2",
        database: "node_project",
    })

    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
      });

    con.query("SELECT * FROM products", (err, result)=>{    
        res.render('pages/index',{result:result});
    })
    
});

app.post('/add_to_cart', function(req, res) {
    var id = req.body.id;
    var name = req.body.name;
    var image = req.body.image;
    var product = {id:id, name:name, image:image};

    if(req.session.cart) {
        var cart = req.session.cart;

        if (!isProductInCart(cart, id)) {
            cart.push(product)
        }
    } else {
        req.session.cart = [product];
        var cart = req.session.cart;
    }

    calculateTotal(cart, req);

    res.redirect('/cart');
})

app.get('/cart', function(req, res) {
    var cart = req.session.cart;
    var total = req.session.total;

    res.render('pages/cart', {cart: cart, total: total});

});

app.get('/product', function(req, res) {
    res.render('pages/products');

});

app.post('/remove_product', function(req, res) {
    var id = req.body.id;
    var cart = req.session.cart;

    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id == id) {
            cart.splice(cart.indexOf(i), 1);
        }
    }

    calculateTotal(cart, req);

    res.redirect('/cart');
});

app.get('/checkout', function(req, res) {
    var total = req.session.total;
    if (total > 0) {
        res.render('pages/checkout', {total:total});
    }
    
});

app.post('/place_order', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var total = req.session.total;
    var products_ids = "";

    var con = mysql.createConnection({
        host: "localhost",
        user: "seteam10",
        password: "QA87uEC2",
        database: "node_project",
    })

    var cart = req.session.cart;
    for (let i = 0; i < cart.length; i++) {
        products_ids = products_ids + "," + cart[i].id;
    }

    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        var query1 = "INSERT INTO orders (total, name, email, products_ids) VALUES ?";
        var values = [
            [total, name, email,products_ids]
        ];

        con.query(query1, [values], (err, result)=> {
            var cart = req.session.cart;
            for (let i = 0; i < cart.length; i++) {
                var query2 = "UPDATE products SET available=0 WHERE id=?";
                id=cart[i].id;
                con.query(query2,id,(err,result)=> {
                    console.log("Success");
                })
            }
        })
    });

    res.redirect('/');

});

app.post('/create_item', function(req, res) {
    var name = req.body.name;
    var description = req.body.description;
    var image = req.body.image;
    var category = req.body.category;
    var location = req.body.location;
    var owner = req.body.owner;
    

    var con = mysql.createConnection({
        host: "localhost",
        user: "seteam10",
        password: "QA87uEC2",
        database: "node_project",
    });

    var query1 = "INSERT INTO products (name, description,image, category, location, owner, available) VALUES ?";

    var values = [
        [name, description,image, category, location, owner, 1]
    ];

    con.query(query1, [values], (err, result)=> {
        if (err) throw err;
        console.log("Success!");
    })

    res.redirect('/');
});