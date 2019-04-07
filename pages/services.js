import React, { Component } from "react";

import withAuth from "../lib/withAuth";

class Services extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>Services Protected Page</h1>
      </div>
    );
  }
}

export default withAuth()(Services);
