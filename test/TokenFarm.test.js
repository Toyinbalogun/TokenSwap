//import our contracts

const DaiToken = artifacts.require('DaiToken');
const DappToken = artifacts.require('DappToken');
const TokenFarm = artifacts.require('TokenFarm');

require('chai')
    .use(require('chai-as-promised'))
    .should()

//helper function to convert tokens to their correct decimal place
function tokens(n) {
    return web3.utils.toWei(n, 'Ether');
}


contract('TokenFarm', ([owner, investor]) => {
    
    let daiToken, dappToken, tokenFarm;

    //before hook
    before(async () => {
        //load contracts
        daiToken = await DaiToken.new();
        dappToken = await DappToken.new();
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)
        
        //transfer all Dapp tokens to token farm (1 million)
        //await dappToken.transfer(tokenFarm.address, '1000000000000000000000000'); 
        //await dappToken.transfer(tokenFarm.address, web3.utils.toWei('1000000', 'Ether')); 
        await dappToken.transfer(tokenFarm.address, tokens('1000000')); 

        //transfer 100 mock DAI tokens to investor
        // await daiToken.transfer(accounts[1], tokens('100'), { from: accounts[0] }); 
        await daiToken.transfer(investor, tokens('100'), { from: owner }); 

    })

    //write tests here...
    describe('Mock DAI deployment', async () => {
        it('has a name', async () => {
            const name = await daiToken.name();
            assert.equal(name, 'Mock DAI Token')
        })

        // it('investor has 100 mock Dai transferred from owner', async () => {
        //     let investorBal = await daiToken.balanceOf(investor);
        //     assert.equal(investorBal.toString(), tokens('100'));
        // })
    })

    describe('Dapp Token deployment', async () => {
        it('has a name', async () => {
            const name = await dappToken.name();
            assert.equal(name, 'Dapp Token')
        })
    })

    describe('Token Farm deployment', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name();
            assert.equal(name, 'Dapp Token Farm')
        })

        //test to see if transfer of all dapp tokens to token farm was complete
        it('contract has tokens', async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address);
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('Farming tokens', async () => {
        it('reward investors for staking mDai tokens', async () => {
            let result;
            
            //check investor balance before staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor Mock Dai wallet balance correct before staking');

            //investor stakes 100 Mock Dai Tokens
            await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor }); //giving this tokenFarm address approval to stake tokens
            await tokenFarm.stakeTokens(tokens('100'), { from: investor });

            //check investor balance after staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'investor Mock Dai wallet balance correct after staking');

            //check tokenFarm balance after investor staking
            result = await daiToken.balanceOf(tokenFarm.address);
            assert.equal(result.toString(), tokens('100'), 'Token farm wallet balance correct after staking');

            //check stakingBalance after investor has staked
            result = await tokenFarm.stakingBalance(investor);
            assert.equal(result.toString(), tokens('100'), 'investor stakingBalance correct after staking');

            //check that an investor isStaking after staking
            result = await tokenFarm.isStaking(investor);
            assert.equal(result.toString(), 'true', 'investor staking status correct after staking');

            //Issue tokens
            await tokenFarm.issueTokens({from: owner});

            // check balances after issuance
            // balance of dappToken the investor has after staking 100 dai tokens
            result = await dappToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'investor DApp wallet balance correct after issuance');

            //Ensure only the owner acan issue tokens
            await tokenFarm.issueTokens({from: investor}).should.be.rejected;

            //unstake Tokens
            await tokenFarm.unstakeTokens({from: investor});

            //check investor balance after unstaking
            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'investor Mock Dai wallet correct after unstaking tokens');

            //token farm balance after unstaking
            result = await daiToken.balanceOf(tokenFarm.address);
            assert.equal(result.toString(), tokens('0'), 'tokenFarm Mock Dai wallet correct after unstaking');

            //check investor status after unstaking
            result = await tokenFarm.isStaking(investor);
            assert.equal(result.toString(), 'false', 'staking status of investor correct after unstaking');
        })
    })

})