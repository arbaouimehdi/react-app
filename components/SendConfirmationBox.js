import React, { Component } from "react";

export default class SendConfirmationBox extends Component {
  componentDidMount() {
    this.props.sendConfirmationCode();
  }

  render() {
    return (
      <div>
        <h1>Account Created please check your email for the activation link</h1>
      </div>
    );
  }
}
