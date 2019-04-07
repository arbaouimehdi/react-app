import React, { Component } from "react";

import redirect from "../lib/redirect";
import checkLoggedIn from "../lib/checkLoggedIn";

import SendResetPasswordBox from "../components/SendResetPasswordBox";

class ResetPassword extends Component {
  static async getInitialProps(context) {
    const { loggedInUser } = await checkLoggedIn(context.apolloClient);

    if (loggedInUser.user) {
      // Already signed in? No need to continue.
      // Throw them back to the main page
      redirect(context, "/");
    }

    return {};
  }

  render() {
    return (
      <React.Fragment>
        <h1>Reset Password</h1>
        <SendResetPasswordBox />
      </React.Fragment>
    );
  }
}

export default ResetPassword;
