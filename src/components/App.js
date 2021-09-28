import React, { Component } from 'react'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {

  async componentWillMount (){ //react lifecycle callback
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() { //fetches the infomation from blockchain and inputs to state
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    // console.log(accounts)
    this.setState({account: accounts[0] })

    //detect network--> Gets the current network ID
    const networkId = await web3.eth.net.getId()
    // console.log(networkId)

    //load daiToken
    const daiTokenData = DaiToken.networks[networkId]
    if (daiTokenData) {
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address) //This allows you to interact with smart contracts as if they were JavaScript objects.
      this.setState({ daiToken })                                                   
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call() //web3 way to call a method from smart contract
      this.setState({ daiTokenBalance: daiTokenBalance.toString() })
      // console.log(daiTokenBalance.toString())
    } else{
      window.alert('DaiToken contract not deployed to detected network!')
    }

    //load dappToken
    const dappTokenData = DappToken.networks[networkId]
    if (dappTokenData) {
      const dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address)
      this.setState({ dappToken })
      let dappTokenBalance = await dappToken.methods.balanceOf(this.state.account).call()
      this.setState({ dappTokenBalance: dappTokenBalance.toString() })
      // console.log( {balance : dappTokenBalance.toString() })
    } else{
      window.alert('DaiToken contract not deployed to detected network!')
    }

    // load tokenFarm
    const tokenFarmData = TokenFarm.networks[networkId]
    if (tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      this.setState({ tokenFarm })
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
      // console.log( {balance : stakingBalance.toString()})
    } else{
      window.alert('DaiToken contract not deployed to detected network!')
    }
  }

  //connect app to web3(blockchain)--> load web3
  async loadWeb3() {
    if (window.ethereum){ //if ethereum obj exists
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3){ //if web3 obj exists
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected! You should try MetaMask!')
    }

    this.setState({ loading : false })
  }

  stakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) =>{
      this.state.tokenFarm.methods.stakeTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ laoding: false })
      }) 
    })
  }

  unstakeTokens = (amount) => {
    this.setState({ loading: true})
    this.state.tokenFarm.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false})
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},
      dappToken: {},
      tokenFarm: {},
      daiTokenBalance: '0', //user dai token balance
      dappTokenBalance: '0', //user dapp token balance
      stakingBalance: '0', //amount user has deposited into the app
      loading: true //loading status

    }
  }

  render() {
    //working on loader
    let content
    if (this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main 
        daiTokenBalance  = {this.state.daiTokenBalance}
        dappTokenBalance = {this.state.dappTokenBalance}
        stakingBalance   = {this.state.stakingBalance}
        stakeTokens      = {this.stakeTokens}
        unstakeTokens    = {this.unstakeTokens}
      />
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
               
               {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
 