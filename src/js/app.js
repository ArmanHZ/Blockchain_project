App = {
    web3Provider: null,
    contracts: {},

    init: async function () {
        $.getJSON('../orders.json', function (data) {

            // for (i = 0; i < data.length; i++) {
            //     var orderAsString = "Order no: " + data[i].id + " Item: " + data[i].name + " Quantity: " + data[i].quantitiy;
            //     var node = document.createElement("LI");
            //     var textnode = document.createTextNode(orderAsString);
            //     node.appendChild(textnode);
            //     document.getElementById("ordersList").appendChild(node);
            // }
        });
        return await App.initWeb3();
    },

    initWeb3: async function () {
        // Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);


        return await App.loadContract();
    },

    loadContract: async function () {
        // Create a JavaScript version of the smart contract
        const smartBakkal = await $.getJSON('SmartBakkal.json');
        App.contracts.SmartBakkal = TruffleContract(smartBakkal);
        App.contracts.SmartBakkal.setProvider(App.web3Provider);

        // Hydrate the smart contract with values from the blockchain
        App.smartBakkal = await App.contracts.SmartBakkal.deployed();
        await App.listOrders();
        return await App.loadAccount();
    },

    loadAccount: async function () {
        // Set the current blockchain account
        App.admin = web3.eth.accounts[0];
        var smartBakkalInstance;
        App.contracts.SmartBakkal.deployed().then(function (instance) {
            smartBakkalInstance = instance;
            return smartBakkalInstance.getSender.call();
        }).then(function (account) {
            App.account = account;
            console.log("Load account: " + App.account);
            return App.setTitle();
        }).catch(function (err) {
            console.log(err.message);
        });
    },

    setTitle: async function () {
        console.log("Set title account: " + App.account);
        if (App.account == "0x5b99A9C66EAd2F0ae898c3c156Eed695b57aFB55".toLowerCase()) {
            document.getElementById("topHeader").innerHTML = "Logged in as Admin: " + App.account;
        } else {
            document.getElementById("topHeader").innerHTML = "Logged in as Normal user: " + App.account;
        }
    },

    addOrder: async function () {
        var smartBakkalInstance;
        App.contracts.SmartBakkal.deployed().then(function (instance) {
            smartBakkalInstance = instance;
            var order = document.getElementById("orderField").value;
            var quantity = document.getElementById("quantityField").value;
            var address = document.getElementById("addressField").value;
            var compleOrder = quantity + " " + order + " to " + address;
            return smartBakkalInstance.createOrder(compleOrder).call();
        }).catch(function (err) {
            console.log(err);
        });
    },

    listOrders: async function () {
        var smartBakkalInstance;
        App.contracts.SmartBakkal.deployed().then(function (instance) {
            smartBakkalInstance = instance;
            return smartBakkalInstance.getOrderCount.call();
        }).then(async function (orderCount) {
            console.log("Order count: " + orderCount);
            for (let i = 0; i < orderCount; i++) {
                const order = await App.smartBakkal.orders(i);
                var orderAsString = App.getOrderAsOneString(order);
                var node = document.createElement("LI");
                var textnode = document.createTextNode(orderAsString);
                node.appendChild(textnode);
                document.getElementById("ordersList").appendChild(node);
            }
        }).catch(function (err) {
            console.log(err);
        });
    },

    getOrderAsOneString: function (orderAsArray) {
        const account = orderAsArray[0];
        const id = orderAsArray[1];
        const content = orderAsArray[2];
        const completed = orderAsArray[3];
        var finalString = "Account id: " + account + "\nOrder no: " + (id + 1) + "\nOder description: " + content
            + "\nIs completed: " + completed;
        return finalString;
    }

};

// For test purposes
function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

$(function () {
    $(window).load(function () {
        App.init();
    });
});