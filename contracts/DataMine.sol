pragma solidity ^0.8.0;


contract DataMine {
    // Data Structure
    struct DataItem {
        address seller;
        string dataHash; // Store a hash of the data for verification
        uint256 price;
        bool available;
    }

    // Mapping to store data items
    mapping(uint256 => DataItem) public dataItems;

    // Unique ID counter for data items
    uint256 public nextId;

    // Mapping to store user authentication status
    mapping(address => bool) public authenticatedUsers;

    // SpruceID contract address
    address public spruceIDContract;

    // Event to notify when a user is authenticated
    event UserAuthenticated(address user);

    // Event to notify when data is transferred
    event DataTransferred(uint256 id, address buyer);

    // Modifier to ensure that the user is authenticated through SpruceID
    modifier onlyAuthenticated() {
        require(authenticatedUsers[msg.sender], "User not authenticated through SpruceID");
        _;
    }

    // Function to authenticate user through SpruceID
    function authenticateUser() external {
        // Add SpruceID authentication logic here
        // Ensure that only valid users are marked as authenticated
        // You may call a function on the SpruceID contract for verification

        authenticatedUsers[msg.sender] = true;
        emit UserAuthenticated(msg.sender);
    }

    // Function to set the SpruceID contract address
    function setSpruceIDContract(address _spruceIDContract) external {
        spruceIDContract = _spruceIDContract;
    }

    // Function to list data for sale (only authenticated users)
    function listData(string memory dataHash, uint256 price) public onlyAuthenticated {
        require(price > 0, "Price must be greater than zero");
        dataItems[nextId] = DataItem(msg.sender, dataHash, price, true);
        nextId++;
    }

    // Function to buy data (only authenticated users)
    function buyData(uint256 id) public payable onlyAuthenticated {
        require(dataItems[id].available, "Data item is not available");
        require(msg.value >= dataItems[id].price, "Insufficient funds");

        // Transfer payment to seller (modify according to token usage)
        address payable seller = payable(dataItems[id].seller);
        seller.transfer(msg.value);

        // Mark data item as sold
        dataItems[id].available = false;

        // Notify data transfer
        emit DataTransferred(id, msg.sender);
    }

    // Function to cancel listing (by seller and only authenticated users)
    function cancelListing(uint256 id) public onlyAuthenticated {
        require(dataItems[id].seller == msg.sender, "Only seller can cancel");
        dataItems[id].available = false;
    }

    // Function to view listed data items
    function viewListedData() public view returns (DataItem[] memory) {
        DataItem[] memory listedData = new DataItem[](nextId);
        for (uint256 i = 0; i < nextId; i++) {
            listedData[i] = dataItems[i];
        }
        return listedData;
    }

    // Function to search data by data type (dataHash)
    function searchData(string memory dataHash) public view returns (DataItem[] memory) {
        DataItem[] memory searchData;
        uint256 count = 0;
        for (uint256 i = 0; i < nextId; i++) {
            if (keccak256(bytes(dataItems[i].dataHash)) == keccak256(bytes(dataHash))) {
                count++;
            }
        }

        searchData = new DataItem[](count);
        count = 0;

        for (uint256 i = 0; i < nextId; i++) {
            if (keccak256(bytes(dataItems[i].dataHash)) == keccak256(bytes(dataHash))) {
                searchData[count] = dataItems[i];
                count++;
            }
        }

        return searchData;
    }
}
