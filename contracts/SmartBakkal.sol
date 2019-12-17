pragma solidity ^0.5.0;

contract SmartBakkal {

    uint private orderCount = 0;

    struct Order {
        address account;
        uint id;
        string content;
        bool completed;
    }

    mapping(uint => Order) public orders;

    function createOrder(string memory _content) public {
        orders[orderCount] = Order(msg.sender, orderCount, _content, false);
        orderCount++;
    }

    function getOrder(uint id) public view returns (uint, string memory, bool) {
        require(id <= orderCount, "Order does not exist.");
        return (orders[id].id, orders[id].content, orders[id].completed);
    }

    function getOrderCount() public view returns (uint) {
        return orderCount;
    }

    function getSender() public view returns (address) {
        return msg.sender;
    }

    function setAsComplete(uint no) public {
        uint orderNo = no - 1;
        orders[orderNo].completed = true;
    }

}