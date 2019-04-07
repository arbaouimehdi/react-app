import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";

import withAuth from "../lib/withAuth";
import redirect from "../lib/redirect";
import checkLoggedIn from "../lib/checkLoggedIn";

import { PASSWORD_RESET_CODE, RESET_PASSWORD } from "../lib/queries";

import ResetPasswordConfirmationBox from "../components/ResetPasswordConfirmationBox";

class ResetPasswordConfirmation extends Component {
  constructor(props) {
    super();
    this.state = {
      passwordResetCodeState:
        (props.query && "passwordResetCode" in props.query) ||
        props.query.passwordResetCode.length > 0
          ? "RESET CODE"
          : "NO RESET CODE",
    };
  }

  static async getInitialProps(context) {
    const { loggedInUser } = await checkLoggedIn(context.apolloClient);

    // Already signed in?.
    // The url doesn't contain passwordResetCode query
    if (loggedInUser.user || !("passwordResetCode" in context.query)) {
      // Throw them back to the main page
      redirect(context, "/");
    }

    return {};
  }

  render() {
    if (this.state.passwordResetCodeState == "RESET CODE") {
      return (
        <React.Fragment>
          {/* Get The Current User Infos */}
          <Query
            query={PASSWORD_RESET_CODE}
            variables={{ activationCodeID: this.props.query.passwordResetCode }}
          >
            {({ loading, error, data }) => {
              if (loading) return "loading...";

              if (error) return `Error! ${error}`;

              /**
               *
               * If the User is Logged in
               *
               */
              console.log(data.PasswordResetCode.id);
              if (data) {
                // Check if the Password Confirmation Exist
                if (data.PasswordResetCode.id) {
                  return (
                    <Mutation
                      mutation={RESET_PASSWORD}
                      variables={{
                        passwordResetCode: data.PasswordResetCode.id,
                      }}
                      onCompleted={data => {
                        console.log(data);
                      }}
                      onError={error => {
                        console.log(error);
                      }}
                    >
                      {(resetPassword, { data, error }) => (
                        <div>
                          <ResetPasswordConfirmationBox
                            resetPassword={resetPassword}
                          />
                        </div>
                      )}
                    </Mutation>
                  );
                }
              }

              return (
                <div>
                  <h1>Password Activation doesn't exist</h1>
                </div>
              );
            }}
          </Query>
        </React.Fragment>
      );
    }

    if (this.state.passwordResetCodeState == "RESET CODE") {
      return <div>loading</div>;
    }
  }
}

export default ResetPasswordConfirmation;
