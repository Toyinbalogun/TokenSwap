pragma solidity ^0.5.0;

import "./DaiToken.sol";
import "./DappToken.sol";

contract TokenFarm {
    //All code goes here
    string public name = "TokenSwap Token Farm"; //state variable
    DappToken public dappToken; //saved as types in this state variables
    DaiToken public daiToken;
    address public owner;

    address[] public stakers; //array of investors
    //key(address) => value(tokens investors are currently staking)
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;


    constructor(DappToken _dappToken, DaiToken _daiToken) public {
         dappToken = _dappToken;
         daiToken = _daiToken;
         owner = msg.sender;
    }
    
    // 1. staking tokens ->> investor putting money into app
    function stakeTokens(uint _amount) public { //1 param, which is amount of tokens to stake
        // code goes here...

        //require that the amount an investor stakes is greater than 0
        require(_amount > 0, "amount staked has to be greater than 0 tokens");

        //transfer mock DAI to contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount); 

        //update staking balance
        stakingBalance[msg.sender] += _amount;
        
        //add investor to stakers array if the investor has not staked before
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        } 

        //update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }
   
    // 2. Issuing tokens ->> earning interest on already staked tokens
    function issueTokens() public {
        //make sure only the owner can call this function
        require(msg.sender == owner, "caller of this function must be the owner");
        
        for (uint i=0; i<stakers.length; i++){
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient] * 10 / 100; //we would match the investors staked tokens 1 dai = 1 dapp interest etc
            if (balance > 0){
                dappToken.transfer(recipient, balance);
            }
        }
    }      
    
    // 3. unstaking tokens ->> withdrow money from app
    function unstakeTokens() public {
        //fetch the staking balance
        uint balance = stakingBalance[msg.sender];

        //require balance that investor has is greater than 0
        require(balance > 0, "balance has to be greater than 0 tokens");

        //transfer balance back to sender
        daiToken.transfer(msg.sender, balance);

        //reset stakingBalance
        stakingBalance[msg.sender] = 0;

        //update staking status
        isStaking[msg.sender] = false;
    }


}