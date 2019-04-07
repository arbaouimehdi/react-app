import React, { Component } from "react";
import { withApollo } from "react-apollo";

class ResetPasswordConfirmationBox extends Component {
  componentDidMount() {
    this.props.resetPassword();
  }

  render() {
    return (
      <h1>
        Password Reset Successfully, Check your email for the new Password
      </h1>
    );
  }
}

export default withApollo(ResetPasswordConfirmationBox);
