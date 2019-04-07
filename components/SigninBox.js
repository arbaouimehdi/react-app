import React, { Component } from "react";
import { Mutation, withApollo } from "react-apollo";
import cookie from "cookie";
import { isEmail, isLength } from "validator";

import redirect from "../lib/redirect";

import { SIGN_IN } from "../lib/queries";

class SigninBox extends Component {
  constructor(props) {
    super();
    this.state = {
      formErrors: {
        email: {
          isEmail: false,
        },
        password: {
          isLength: false,
        },
      },
    };
  }

  handleChangeEmail = e => {
    this.setState({
      formErrors: {
        email: {
          isEmail: isEmail(e.target.value),
        },
        password: {
          isLength: this.state.formErrors.password.isLength,
        },
      },
    });
  };

  handleChangePassword = e => {
    this.setState({
      formErrors: {
        email: {
          isEmail: this.state.formErrors.email.isEmail,
        },
        password: {
          isLength: isLength(e.target.value, { min: 6, max: 36 }),
        },
      },
    });
  };

  render() {
    let email, password;

    return (
      <Mutation
        mutation={SIGN_IN}
        onCompleted={data => {
          // Store the token in cookie
          document.cookie = cookie.serialize(
            "token",
            data.authenticateUser.token,
            {
              maxAge: 30 * 24 * 60 * 60, // 30 days
            },
          );
          // Force a reload of all the current queries now that the user is
          // logged in
          this.props.client.cache.reset().then(() => {
            redirect({}, "/");
          });
        }}
        onError={error => {
          error.graphQLErrors.map(({ functionError }) =>
            console.log(functionError.message),
          );
        }}
      >
        {(authenticateUser, { loading, error, data }) => {
          return (
            <div className="authForm">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  e.stopPropagation();

                  authenticateUser({
                    variables: {
                      email: email.value,
                      password: password.value,
                    },
                  });

                  // email.value = password.value = "";
                }}
              >
                {loading && <div>Loading</div>}

                {error &&
                  error.graphQLErrors.map(({ functionError }, index) => (
                    <div className="Alert Alert--error" key={`error-${index}`}>
                      {functionError.message}
                    </div>
                  ))}
                <div>
                  <label htmlFor="email">Email</label>
                  <input
                    name="email"
                    ref={node => {
                      email = node;
                    }}
                    type="text"
                    className="Input Input-Text"
                    onChange={this.handleChangeEmail}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password">Password</label>
                  <input
                    name="password"
                    ref={node => {
                      password = node;
                    }}
                    type="password"
                    className="Input Input-Text"
                    onChange={this.handleChangePassword}
                    required
                  />
                </div>
                <div>
                  <button
                    className="Btn Btn--primary"
                    disabled={
                      this.state.formErrors.email.isEmail &&
                      this.state.formErrors.password.isLength
                        ? false
                        : true
                    }
                  >
                    Sign in
                  </button>
                </div>
              </form>
            </div>
          );
        }}
      </Mutation>
    );
  }
}

export default withApollo(SigninBox);
