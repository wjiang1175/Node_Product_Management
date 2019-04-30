var inquirer = require("inquirer");
var mysql = require("mysql");
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon_DB"
});

connection.connect(function (err) {
    if (err) throw err;
    afterConnect();
});
function afterConnect() {
    connection.query('select * from products', function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            // console.log(res)
            console.log(`ID: ${res[i].id} | Product: ${res[i].product_name} | Department: ${res[i].department_name} | Price: ${res[i].price} | Stock: ${res[i].stock}`);
            console.log('--------------------------------------------------------------------------------')
        };
        UserIDChoice();
    });
};

function UserIDChoice() {
    inquirer.prompt([
        {
            name: "id",
            type: "input",
            message: "What is the ID of the Proudct you would like to buy?"
        },
    ])
        .then(function (answer) {
            searchID(answer.id);
        });

}


function searchID(product) {
    connection.query("SELECT * FROM products WHERE ?", { id: product }, function (err, res) {
        if (err) throw err;
        console.log(`ID: ${res[0].id} | Product: ${res[0].product_name} | Department: ${res[0].department_name} | Price: ${res[0].price} | Stock: ${res[0].stock}`);
        UnitPurchaseAmount(res[0]);
    })

}

function UnitPurchaseAmount(BAmazon) {
    inquirer.prompt([
        {
            name: "stock",
            type: "input",
            message: "How many units would you like to purchase?"
        }
    ])
        .then(function (answer) {
            if (answer.stock > BAmazon.stock) {
                console.log("we only have " + BAmazon.stock + " in stock.");
                UnitPurchaseAmount(BAmazon);
            } else {
                var stockLeft = BAmazon.stock - answer.stock;
                var cost = answer.stock * parseInt(BAmazon.price);
                updateProduct(stockLeft, BAmazon.id, BAmazon.productSale);
                console.log("This Will Cost You " + cost);
            }
        })
}

function updateProduct(stockLeft, stockID, productSale) {
    console.log("Updating all Amazon Products...\n");
    var query = connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock: stockLeft
            },
            {
                id: stockID
            },
            {
                product_sales: productSale
            }
        ],
        function (err, res) {
            console.log(res.affectedRows + " products updated!\n");
            console.log("We Have " + stockLeft + " in stock Left");
        }
    );
    // logs the actual query being run
    console.log(query.sql);
}

