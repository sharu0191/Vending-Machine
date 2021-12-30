const itemList = document.getElementById('item_list');
const currentAmount = document.getElementById('currentAmount');
const messageDiv = document.querySelector("#message");
const purchasedItem = document.getElementById('purchased_items');

let currentBalance;
let productQty;
let cartItemArr = [];

const showAlert = function(message, msgClass) {
    messageDiv.innerHTML = message;
    messageDiv.classList.add(msgClass, "show");
    messageDiv.classList.remove("hide");
    setTimeout(() => {
        messageDiv.classList.remove("show", msgClass);
        messageDiv.classList.add("hide");
        messageDiv.innerHTML = '';
    }, 1000);

    return;
};

const showBalance = () => {
    currentAmount.innerHTML = `<h3><b>₹ ${currentBalance}</b></h3>`;

}
const reloadPage = () => {
    window.location.reload();
}

const refreshData = () => {
    fetch('http://localhost:3000/products', {
            method: 'GET',
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            }
        })
        .then(response => response.json())
        .then(json => {
            let htmlcode = '';
            for (let [ind, list] of json.entries()) {
                let productCount = list.quantity;
                if (productCount > 0) {
                    htmlcode +=
                        `<div class="container">
                        <div class= "row justify-content-md-center cont-5">
                            <div class="col col-md-5"><p><b>${list.name}</b> <small>(${list.quantity})</small> <br>₹ ${list.price}</p></div>
                            <div class="col-md-2" >
                                <div class="btn-group">
                                    <button onclick='addItem(${list.id},"${list.name}", ${list.price}, ${list.quantity})' class="btn btn-info">Buy</button>
                                </div>
                            </div>
                        </div>
                    </div>`;

                    itemList.innerHTML = htmlcode;
                } else {
                    htmlcode +=
                        `<div class="container">
                            <div class= "row justify-content-md-center cont-5">
                                <div class="col col-md-5"><p><b>${list.name}</b> <small>(${list.quantity})</small> <br>₹ ${list.price}</p></div>
                                <div class="col-md-2" >
                                    <div class="btn-group">
                                        <button onclick='addItem(${list.id},"${list.name}", ${list.price}, ${list.quantity})' class="btn btn-info disabled">Buy</button>
                                    </div>
                                </div>
                            </div>
                        </div>`;

                    itemList.innerHTML = htmlcode;
                }

            }
        });

    fetch('http://localhost:3000/wallet/1', {
            method: "GET",
            headers: { 'content-type': 'application/json; charset=UTF-8' }
        })
        .then(response => response.json())
        .then(json => {
            currentBalance = json.amount;
            showBalance();
        })


    fetch('http://localhost:3000/cartItems', {
            method: 'GET',
            headers: { 'content-type': 'application/json; charset=UTF-8' }
        })
        .then(res => res.json())
        .then(json => {
            let htmlcode = '';
            for (let [ind, list] of json.entries()) {
                htmlcode +=
                    `<div class="container">
                        <div class= "row justify-content-md-center cont-5">
                            <div class="col col-md-5"><p><b>${list.name} x${list.buyqty}</b></p></div>
                            <div class="col"><button class="btn btn-danger" onclick='removeItem(${list.id},"${list.name}", ${list.price}, ${list.quantity}, ${list.buyqty})'>Return</button></div>
                        </div>
                    </div>`;
                purchasedItem.innerHTML = htmlcode;
            }
        })
}

window.onload = refreshData();

const addAmount = (amt) => {
    currentBalance += amt;
    fetch('http://localhost:3000/wallet/1', {
            method: "PUT",
            headers: { 'Content-type': 'application/json; charset=UTF-8' },
            body: JSON.stringify({ amount: currentBalance })
        })
        .then(response => response.json())
        .catch(err => console.log(err))
    showBalance();
    showAlert(`₹ ${amt} added to your wallet`, "alert-success");
}

const addItem = (id, pro_name, pro_price, pro_qty) => {
    pro_qty -= 1;
    if (currentBalance < pro_price) {
        showAlert("Insufficient Balance, Please Recharge Your Wallet", "alert-danger");
    } else {
        fetch('http://localhost:3000/cartItems', {
                method: 'GET',
                headers: { 'content-type': 'application/json; charset=UTF-8' }
            })
            .then(res => res.json())
            .then(json => {
                cartItemArr = json;
                console.log(cartItemArr);
                let buyqty = 1;
                if (cartItemArr.length === 0) {
                    fetch('http://localhost:3000/cartItems', {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json, text/plain, */*',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ name: pro_name, price: pro_price, quantity: pro_qty, buyqty: buyqty })
                        })
                        .then(res2 => res2.json())
                        .then(json2 => console.log(json2));

                } else {
                    var check_name = cartItemArr.filter(nm => (nm.name === pro_name))
                    if (check_name.length >= 1) {
                        for (let [ind, list] of cartItemArr.entries()) {
                            if (list.name === pro_name) {
                                buyqty = list.buyqty + 1;
                                fetch(`http://localhost:3000/cartItems/${list.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-type': 'application/json; charset=UTF-8' },
                                        body: JSON.stringify({ name: pro_name, price: pro_price, quantity: pro_qty, buyqty: buyqty })
                                    })
                                    .then(res1 => res1.json())
                                    .then(json1 => console.log(json1))
                                    .catch(err => console.log(err))
                                break;
                            } else {
                                continue;
                            }
                        }
                    } else {
                        fetch('http://localhost:3000/cartItems', {
                                method: 'POST',
                                headers: {
                                    'Accept': 'application/json, text/plain, */*',
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ name: pro_name, price: pro_price, quantity: pro_qty, buyqty: buyqty })
                            })
                            .then(res2 => res2.json())
                            .then(json2 => console.log(json2))
                            .catch(err => console.log(err))
                    }
                }
            })

        currentBalance = currentBalance - pro_price;
        fetch('http://localhost:3000/wallet/1', {
                method: 'PUT',
                headers: { 'Content-type': 'application/json; charset=UTF-8' },
                body: JSON.stringify({ amount: currentBalance })
            }).then(response => response.json())
            .catch(err => console.log(err));

        fetch(`http://localhost:3000/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-type': 'application/json; charset=UTF-8' },
                body: JSON.stringify({ id: id, name: pro_name, price: pro_price, quantity: pro_qty })
            }).then(response => response.json())
            .catch(err => console.log(err));

        refreshData();
        showAlert(`${pro_name} purchased successfully`, "alert-success");
    }

    // reloadPage();
}


const removeItem = (id, pro_name, pro_price, pro_quantity, buyqty) => {
    let cartItemName;
    fetch(`http://localhost:3000/cartItems/${id}`, {
            method: 'GET',
            headers: { 'content-type': 'application/json; charset=UTF-8' }
        })
        .then(res => res.json())
        .then(json => {
            if (confirm(`Are you sure to remove ${json.name}?`)) {
                console.log(buyqty);
                if (buyqty === 1) {
                    fetch(`http://localhost:3000/cartItems/${json.id}`, {
                            method: 'DELETE'
                        })
                        .then(res => res.json())
                        .then(json => console.log(json));
                    currentBalance = currentBalance + pro_price;
                    console.log(currentBalance);
                    fetch('http://localhost:3000/wallet/1', {
                            method: 'PUT',
                            headers: { 'Content-type': 'application/json; charset=UTF-8' },
                            body: JSON.stringify({ amount: currentBalance })
                        }).then(response => response.json())
                        .catch(err => console.log(err));
                    cartItemName = json.name;
                    fetch('http://localhost:3000/products', {
                            method: 'GET',
                            headers: {
                                'Content-type': 'application/json; charset=UTF-8'
                            }
                        })
                        .then(response => response.json())
                        .then(json => {
                            for (let [ind, list] of json.entries()) {
                                if (cartItemName === list.name) {
                                    productQty = list.quantity + 1;
                                    fetch(`http://localhost:3000/products/${list.id}`, {
                                            method: 'PUT',
                                            headers: { 'Content-type': 'application/json; charset=UTF-8' },
                                            body: JSON.stringify({ id: list.id, name: pro_name, price: pro_price, quantity: productQty })
                                        })
                                        .then(response => response.json())
                                        .catch(err => console.log(err));
                                }
                            }
                        });
                } else {
                    buyqty -= 1;
                    pro_quantity = pro_quantity + 1;
                    fetch(`http://localhost:3000/cartItems/${json.id}`, {
                            method: 'PUT',
                            headers: { 'Content-type': 'application/json; charset=UTF-8' },
                            body: JSON.stringify({ name: pro_name, price: pro_price, quantity: pro_quantity, buyqty: buyqty })
                        })
                        .then(response => response.json())
                        .catch(err => console.log(err));

                    cartItemName = json.name;
                    fetch('http://localhost:3000/products', {
                            method: 'GET',
                            headers: {
                                'Content-type': 'application/json; charset=UTF-8'
                            }
                        })
                        .then(response => response.json())
                        .then(json => {
                            for (let [ind, list] of json.entries()) {
                                if (cartItemName === list.name) {
                                    productQty = list.quantity + 1;
                                    fetch(`http://localhost:3000/products/${list.id}`, {
                                            method: 'PUT',
                                            headers: { 'Content-type': 'application/json; charset=UTF-8' },
                                            body: JSON.stringify({ id: list.id, name: pro_name, price: pro_price, quantity: productQty })
                                        })
                                        .then(response => response.json())
                                        .catch(err => console.log(err));
                                }
                            }
                        });
                    currentBalance = currentBalance + pro_price;
                    console.log(currentBalance);
                    fetch('http://localhost:3000/wallet/1', {
                            method: 'PUT',
                            headers: { 'Content-type': 'application/json; charset=UTF-8' },
                            body: JSON.stringify({ amount: currentBalance })
                        }).then(response => response.json())
                        .catch(err => console.log(err));
                    // reloadPage();
                }
                refreshData();
                showAlert(`Removed successfully`, "alert-success");
            }
        })
}