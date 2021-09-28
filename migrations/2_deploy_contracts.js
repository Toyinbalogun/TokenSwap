//This migration file is going to put new smart contracts
//on the blockchain

//importing DaiToken and DappToken 
const DaiToken = artifacts.require('DaiToken');
const DappToken = artifacts.require('DappToken');
const TokenFarm = artifacts.require('TokenFarm');

module.exports = async function(deployer, network, accounts) {
    //firstly deploy the Mock DAI Token
    await deployer.deploy(DaiToken);
    const daiToken = await DaiToken.deployed();
    
    //then deploy the Dapp Token
    await deployer.deploy(DappToken);
    const dappToken = await DappToken.deployed();
    
    //then deploy the TokenFarm 
    await deployer.deploy(TokenFarm, dappToken.address, daiToken.address);
    const tokenFarm = await TokenFarm.deployed();
    
    //transfer all DApp tokens to TokenFarm (1 million)
    await dappToken.transfer(tokenFarm.address, '1000000000000000000000000'); 

    //transfer 100 mock DAI tokens to investor
    //in our case first account is the deployer and second account(account[1]) ==> investor
    await daiToken.transfer(accounts[1], '1000000000000000000000'); //1 dai = 1000000000000000000

};
