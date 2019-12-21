pragma solidity ^0.5.0;

contract SmartBakkal {

    address private contractOwner;

    uint private orderCount = 0;

    constructor() public {
        contractOwner = msg.sender;
    }

    struct Order {
        address account;
        uint id;
        string content;
        bool completed;
        uint248 paidAmount;
    }

    mapping(uint => Order) public orders;

    function createOrder(string memory _content, uint248 paidAmount) public payable {
        orders[orderCount] = Order(msg.sender, orderCount, _content, false, paidAmount);
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

    function setAsComplete(uint no) public payable {
        require(msg.sender == contractOwner, "Only the contract owner is allowed to perform this action.");
        uint orderNo = no - 1;
        orders[orderNo].completed = true;
        msg.sender.transfer(address(this).balance - orders[orderNo].paidAmount);
    }

}