import React, { Component } from "react";
import AuctionContract from "./contracts/Auction.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { highestBid: 0, highestBidder: null, web3: null, accounts: null, contract: null, input: ""};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = AuctionContract.networks[networkId];
      const instance = new web3.eth.Contract(
        AuctionContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      
      const response = await instance.methods.highestBid().call();
      
      const bidderAddr = await instance.methods.highestBidder().call();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, highestBid: response, highestBidder: bidderAddr });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  bid = async () => {
    const { accounts, contract } = this.state;

    await contract.methods.bid().send({ from: accounts[0], value: this.state.input });

  };
  
  withdraw = async () => {
    const {accounts, contract} = this.state;

    await contract.methods.withdraw().send({ from: accounts[0]});

  };
  
  myChangeHandler = (event) => {
    this.setState({input: event.target.value}, ()=> {
        console.log(this.state.input)
    });
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Welcome to the Auction:</h1>
        <div>The highestBidder is: {this.state.highestBidder}</div>
        <div>The highestBid is: {this.state.highestBid}</div>
        <div>Please bid higher amount !</div>
        <input type="text" onChange={this.myChangeHandler}/>
        <button onClick={this.bid}>Bid</button>
        
        <h1>Withdraw:</h1>
        <div>You can ONLY withdraw if you are not the highest bidder:</div>
        <button onClick={this.withdraw}>Withdraw</button>
      </div>
    );
  }
}

export default App;
