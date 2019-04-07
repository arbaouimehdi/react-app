import React from "react";
import Link from "next/link";
import { withApollo } from "react-apollo";

class Nav extends React.Component {
  render() {
    return (
      <nav className="Nav">
        <ul>
          <li>
            <Link prefetch href="/">
              <a>Home</a>
            </Link>
          </li>
          <li>
            <Link prefetch href="/services">
              <a>Services</a>
            </Link>
          </li>
          <li>
            <Link prefetch href="/settings/profile">
              <a>User Settings</a>
            </Link>
          </li>
          <li>
            <Link prefetch href="/signin">
              <a>Signin</a>
            </Link>
          </li>
          <li>
            <Link prefetch href="/create-account">
              <a>Create Account</a>
            </Link>
          </li>
          <li>
            <Link prefetch href="/reset-password">
              <a>Forgot Password</a>
            </Link>
          </li>
        </ul>
      </nav>
    );
  }
}

export default withApollo(Nav);
