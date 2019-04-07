import React, { Component } from "react";

import checkLoggedIn from "../lib/checkLoggedIn";

export default class updateAccount extends Component {
  static async getInitialProps(context) {
    const { loggedInUser } = await checkLoggedIn(context.apolloClient);

    console.log(loggedInUser);
  }

  render() {
    return (
      <React.Fragment>
        <div>xxxx</div>
      </React.Fragment>
    );
  }
}
