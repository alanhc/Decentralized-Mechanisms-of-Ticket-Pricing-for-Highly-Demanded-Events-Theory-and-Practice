// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "./Presale_v0.sol";
import "./Market_v0.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract EventFactory_v0 {
    address[] public events;
    address public presale_addr = address(0);
    address public market_addr = address(0);
    event EventCreated(address);

    constructor(address presale_addr_, address market_addr_) {
        presale_addr = presale_addr_;
        market_addr = market_addr_;
    }

    function createEvent(
        string memory name,
        string memory symbol,
        uint256 max_tickets,
        uint256 max_presale
    ) public {
        Event_v0 e = new Event_v0(
            presale_addr,
            market_addr,
            name,
            symbol,
            msg.sender,
            max_tickets,
            max_presale
        );
        events.push(address(e));
        emit EventCreated(address(e));
    }

    function getDeployEvents() public view returns (address[] memory) {
        return events;
    }
}

contract Event_v0 is ERC721, ERC721Pausable, ERC721Burnable {
    struct Royalty {
        address target;
        uint256 royalty;
    }
    struct Ticket {
        uint256 start_at;
        uint256 end_at;
        uint256 discount_rate;
        uint256 start_price;
        uint256 class_;
        uint256 sell_price;
    }
    mapping(uint256=>uint256) public prices; // class=>price
    address private _owner;
    Presale_v0 presale_contract;
    mapping(uint256 => Royalty) public income; // idx => royalty
    uint256 max_income;
    string public base_uri;

    function set_base_uri(string memory base_uri_) public onlyOwner {
        base_uri = base_uri_;
    }

    function set_income(
        uint256 i,
        address to,
        uint256 amount
    ) public onlyOwner {
        if (income[i].target == address(0)) max_income++;
        income[i] = Royalty(to, amount);
    }

    constructor(
        address presale_addr_,
        address market_addr_,
        string memory name,
        string memory symbol,
        address manager,
        uint256 max_tickets_,
        uint256 max_presale
    ) ERC721(name, symbol) {
        presale_addr = presale_addr_;
        market_addr = market_addr_;
        presale_contract = Presale_v0(presale_addr_);
        market_contract = Market_v0(market_addr_);
        presale_contract.set_presale(max_presale);

        max_tickets = max_tickets_;
        max_income = 0;
        event_start = MAX_INT;
        _owner = manager;
    }

    uint256 MAX_INT =
        0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

    address presale_addr;
    address market_addr;
    mapping(uint256 => Ticket) public tickets; //id->ticket
    uint256 public max_tickets;

    uint256 event_start;

    function _baseURI() internal view virtual override returns (string memory) {
        return base_uri;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        // _requireMinted(tokenId);
        require(exists(tokenId), "token not minted");
        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length > 0
                ? string(
                    abi.encodePacked(baseURI, "/", Strings.toString(tokenId))
                )
                : "";
    }

    function owner() public view returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(owner() == msg.sender, "not manager");
        _;
    }
    
    function set_tickets(uint256[] memory tokenIds,uint256[] memory start_at, uint256[] memory end_at, uint256[] memory discount_rate,uint256[] memory start_price,uint256[] memory class_) public onlyOwner {
        for (uint i=0; i<tokenIds.length; i++) {
            tickets[ tokenIds[i] ] = Ticket(start_at[i], end_at[i], discount_rate[i], start_price[i], class_[i], 0);
        }
    }

    Market_v0 market_contract;
    uint256 sales_royalty = 0;

    function set_sales_royalties(uint256 percentage) public onlyOwner {
        require(
            0 < percentage && percentage <= 25,
            "percentage should >0 && <=25"
        );
        sales_royalty = percentage;
    }

    function list_on_marketplace(
        uint256 tokenId,
        uint256 price,
        uint256 royalty
    ) public {
        require(ownerOf(tokenId) == msg.sender, "not owner");
        require(0 <= royalty && royalty <= 25, "percentage should >=0 && <=25");
        approve(address(this), tokenId);
        if (sales_royalty > 0)
            market_contract.set_royalty(
                address(this),
                tokenId,
                address(this),
                sales_royalty
            );
        if (royalty > 0)
            market_contract.set_royalty(
                address(this),
                tokenId,
                msg.sender,
                royalty
            );
        market_contract.list_on_marketplace(
            msg.sender,
            address(this),
            tokenId,
            price
        );
    }

    function buy_from_market(uint256 tokenId) public payable {
        require(
            market_contract.get_listing(address(this), tokenId),
            "not listing"
        );
        require(
            msg.value >= market_contract.get_price(address(this), tokenId),
            "not enough money"
        );
        address[] memory to;
        uint256[] memory percentage;
        uint256 max_royalties;
        (to, percentage, max_royalties) = market_contract.get_royalties(
            address(this),
            tokenId
        );
        for (uint i = 0; i < max_royalties; i++) {
            payable(to[i]).transfer((msg.value * percentage[i]) / 100);
        }
        address seller = market_contract.get_seller(address(this), tokenId);
        market_contract.set_listing(address(this), tokenId, false);
        this.safeTransferFrom(seller, msg.sender, tokenId);
    }

    function register(uint256 tokenId) public payable {
        uint end_prcie = (tickets[tokenId].end_at-tickets[tokenId].start_at)*tickets[tokenId].discount_rate;
        require(msg.value >= end_prcie, "not enough money");
        require(
            !presale_contract.in_queue(address(this), msg.sender),
            "user should register only once"
        );
        presale_contract.register(msg.sender, tokenId);
    }

    function get_winners() public onlyOwner {
        presale_contract.get_winners();
    }

    function transfer(address to, uint256 amount) public {
        require(msg.sender == presale_addr, "not allow");
        payable(to).transfer(amount);
    }

    function get_price(uint256 tokenId) public view returns (uint256) {
        console.log( block.timestamp , tickets[tokenId].start_at);
        uint256 timeElapsed = block.timestamp - tickets[tokenId].start_at;
        
        uint256 discount =  tickets[tokenId].discount_rate * timeElapsed;
        
        return tickets[tokenId].start_price-discount;
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    function batch_buy(uint256[] memory ids) public payable {
        uint256 ticket_pay_price = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            require(!exists(ids[i]), "token exist");
            require(block.timestamp<=tickets[ids[i]].end_at,"event already end");
            ticket_pay_price += get_price(ids[i]);
        }
        require(msg.value >= ticket_pay_price, "amount not enough");
        for (uint256 i = 0; i < ids.length; i++) {
            prices[ tickets[ids[i]].class_ ] = msg.value;
            tickets[ids[i]].sell_price = msg.value;
            this.mint(msg.sender, ids[i]);
        }
    }
    function claim(uint256[] memory ids) public {
        for (uint i=0; i<ids.length; i++) {
            require(block.timestamp>tickets[ids[i]].end_at, "not end sell");
        }
        for (uint256 i=0; i<ids.length; i++) {
            if (ownerOf(i)==msg.sender) {
                uint256 refund_ = tickets[ids[i]].sell_price - prices[ tickets[ids[i]].class_ ];
                payable(msg.sender).transfer(refund_);
            }
        }
    }
    

    function mint(address to, uint256 tokenId) public {
        require(
            msg.sender == presale_addr || msg.sender == address(this),
            "not allow"
        );
        _safeMint(to, tokenId);
    }

    function cancel() public onlyOwner {
        require(
            block.timestamp < event_start,
            "event already start, can't cancel"
        );

        for (uint256 i = 0; i < max_tickets; i++) {
            if (exists(i)) {
                payable(ownerOf(i)).transfer(tickets[i].sell_price);
            }
        }
        pause();
    }

    function refund(address to, uint256 tokenId) public {
        require(
            block.timestamp < event_start,
            "event already start, can't refund"
        );
        require(
            ownerOf(tokenId) == msg.sender || msg.sender == presale_addr,
            "not owner"
        );
        if (exists(tokenId) && ownerOf(tokenId) == msg.sender)
            _burn(tokenId);
        //if (!exists(tokenId)) _burn(tokenId);
        uint refund_ = (tickets[tokenId].end_at-tickets[tokenId].start_at)*tickets[tokenId].discount_rate;
        payable(to).transfer(refund_);
    }

    function withdraw() public {
        uint256 revenue = address(this).balance;
        for (uint i = 0; i < max_income; i++) {
            payable(income[i].target).transfer(
                (revenue * income[i].royalty) / 100
            );
        }
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Pausable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }
}
