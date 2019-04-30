var inquirer = require("inquirer");
var mysql = require("mysql");
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon_DB"
});

function displayProducts(res) {
    for (var i = 0; i < res.length; i++) {
        // console.log(res)
        console.log(`ID: ${res[i].id} | Product: ${res[i].product_name} | Department: ${res[i].department_name} | Price: ${res[i].price} | Stock: ${res[i].stock}`);
        console.log('--------------------------------------------------------------------------------')
    }
}


connection.connect(function (err) {
    if (err) throw err;
    BamazonManager();
});

function BamazonManager() {
    inquirer.prompt([
        {
            name: "managerOption",
            type: "list",
            message: "New Options: ",
            choices: ["View Products For Sale", "View Low Inventory", "Add To Inventory", "Add New Product", "Exit"]
        }
    ]).then((res) => {
        switch (res.managerOption) {
            case "View Products For Sale":
                ViewProduct();
                break;

            case "View Low Inventory":
                LowInventory();
                break;

            case "Add To Inventory":
                addToInventory();
                break;

            case "Add New Product":
                addNewProduct()
                break;

            case "Exit":
                connection.end();
                break;
        }
        // console.log(res)
    })
}

function ViewProduct() {
    connection.query('select * from products', function (err, res) {
        if (err) throw err;

        // console.log(res)
        displayProducts(res);
        BamazonManager();

    });
};

function LowInventory() {
    console.log("Low Inventory Products \n")
    connection.query("SELECT * FROM products WHERE stock < 5", function (err, res) {
        if (err) throw err;
        // console.log(res)
        displayProducts(res);
        BamazonManager();
    })
}

function addToInventory() {

    console.log("Select product by ID number...\n");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        //display all products
        displayProducts(res);
        restock();
    });
}

function restock() {
    inquirer.prompt([{
        message: "Choose product by ID number",
        name: "userIDChoice"
    }]).then((response) => {
        // console.log(response);
        restockItem(response.userIDChoice);
    });
}

function restockItem(choice) {
    connection.query("SELECT * FROM products WHERE ?", [{
        id: choice
    }], function (err, res) {
        if (err) throw err;

        // Log all results of the SELECT statement
        console.log(`ID: ${res[0].id} \nProduct: ${res[0].product_name}\nName: ${res[0].department_name}\nPrice: ${res[0].price}\nItems in Stock: ${res[0].stock}`);

        restockAmount(res[0]);
    });
}

function restockAmount(product) {
    inquirer.prompt([{
        message: "How much would you like to restock it by?",
        name: "restockAmount"
    }]).then((response) => {
        var newAmount = parseFloat(response.restockAmount) + product.stock;
        connection.query(`UPDATE products SET stock = stock+${response.restockAmount} where id = ${product.id};`, function (err, res) {
            if (err) throw err;
            console.log(`You restocked ${product.product_name}.  Now you have a total of ` + newAmount + ".");
            // go back to main menu
            BamazonManager();
        });
    });
}

function addNewProduct() {
    console.log("New product: ");
    inquirer.prompt([{
        message: "Add name of product",
        name: "Name"
    }, {
        message: "Add department name",
        name: "Department"
    },
    {
        message: "Add price",
        name: "Price"
    },
    {
        message: "Quantity of products",
        name: "Quantity"
    }
    ]).then((product) => {
        connection.query("INSERT INTO products SET ?", [{
            product_name: product.Name,
            department_name: product.Department,
            price: product.Price,
            stock: product.Quantity
        }], (err, res) => {
            if (err) throw err;
            console.log(`-------------------------------------------------------------------`);
            console.log("Product added to the inventory");
            console.log(`Product Name: ${product.Name}\n Product Department: ${product.Department}\n Product Price: ${product.Price}\n Product Stock: ${product.Quantity}`);
            // displayProdcuts();
            console.log(`-------------------------------------------------------------------`);
        })

    });
}
