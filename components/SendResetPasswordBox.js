import React, { Component } from "react";
import { Mutation, withApollo } from "react-apollo";
import { isEmail } from "validator";

import { SEND_RESET_PASSWORD } from "../lib/queries";

class SendResetPasswordBox extends Component {
  constructor(props) {
    super();
    this.state = {
      resetPasswordStatus: "NOT SENT",
      formErrors: {
        email: {
          isEmail: false,
        },
      },
    };
  }

  handleError(error) {
    console.log(error);
  }

  handleChangeEmail = e => {
    this.setState({
      resetPasswordStatus: this.state.resetPasswordStatus,
      formErrors: {
        email: {
          isEmail: isEmail(e.target.value),
        },
      },
    });
  };

  render() {
    let email;

    if (this.state.resetPasswordStatus === "NOT SENT") {
      return (
        <Mutation
          mutation={SEND_RESET_PASSWORD}
          // Mutation Successfully completed
          onCompleted={data => {
            if (data) {
              this.setState({
                resetPasswordStatus: "SENT",
              });
            }
          }}
          // Mutation Error
          onError={error => {
            this.handleError(error);
          }}
        >
          {(sendResetPassword, { loading, error, data }) => {
            return (
              <div className="authForm">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    e.stopPropagation();

                    sendResetPassword({
                      variables: {
                        userEmail: email.value,
                      },
                    });

                    email.value = "";
                  }}
                >
                  {loading && <div>loading</div>}

                  {error &&
                    error.graphQLErrors.map(({ functionError }, index) => (
                      <div
                        className="Alert Alert--error"
                        key={`error-${index}`}
                      >
                        {functionError ? functionError.message : ""}
                      </div>
                    ))}

                  <div>
                    <label htmlFor="email">Email</label>
                    <input
                      name="email"
                      ref={node => {
                        email = node;
                      }}
                      type="email"
                      className="Input Input-Text"
                      onChange={this.handleChangeEmail}
                      required
                    />
                  </div>
                  <div>
                    <button
                      className="Btn Btn--primary"
                      disabled={!this.state.formErrors.email.isEmail}
                    >
                      Send Password
                    </button>
                  </div>
                </form>
              </div>
            );
          }}
        </Mutation>
      );
    }

    if (this.state.resetPasswordStatus === "SENT") {
      return <h1>Check your email for the Password Reset URL</h1>;
    }
  }
}

export default withApollo(SendResetPasswordBox);
