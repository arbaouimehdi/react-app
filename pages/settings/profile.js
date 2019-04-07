import React, { Component } from "react";
import { withApollo } from "react-apollo";

import redirect from "../../lib/redirect";
import checkLoggedIn from "../../lib/checkLoggedIn";

import UpdateUserInfos from "../../components/UpdateUserInfosBox";

class SettingsProfile extends Component {
  static async getInitialProps(context, apolloClient) {
    const { loggedInUser } = await checkLoggedIn(context.apolloClient);

    // If not signed in, send them somewhere more useful
    if (!loggedInUser.user) {
      redirect(context, "/signin");
    }

    return { loggedInUser };
  }
  render() {
    return (
      <React.Fragment>
        <h1>User Settings</h1>
        <UpdateUserInfos />
      </React.Fragment>
    );
  }
}

export default withApollo(SettingsProfile);
