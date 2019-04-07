import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";

import { ACTIVATION_CODE, ACTIVATE_ACCOUNT } from "../lib/queries";

import ActivateAccountBox from "../components/ActivateAccountBox";

export default class ActivateAccount extends Component {
  render() {
    return (
      <React.Fragment>
        <Query
          query={ACTIVATION_CODE}
          variables={{ activationCode: this.props.query.accountActivationCode }}
        >
          {({ loading, error, data }) => {
            if (loading) return "Loading...";

            if (error) return `Error! ${error.message}`;

            /**
             *
             * If the query return Data
             *
             */
            if (data) {
              const { AccountActivationCode } = data;

              // If the activation code doesn't exist
              if (!AccountActivationCode) {
                return <ActivateAccountBox activationStatus={"DOESNT EXIST"} />;
              }

              // If the account is not activated
              if (!AccountActivationCode.user.accountActivated) {
                return (
                  <Mutation
                    mutation={ACTIVATE_ACCOUNT}
                    variables={{
                      activationCode: this.props.query.accountActivationCode,
                    }}
                  >
                    {(activateAccount, { loading, error }) => (
                      <ActivateAccountBox
                        activateAccount={activateAccount}
                        activationStatus={"NOT ACTIVATED"}
                      />
                    )}
                  </Mutation>
                );
              }

              // If the account is already activated
              else {
                return (
                  <ActivateAccountBox activationStatus={"ALREADY ACTIVATED"} />
                );
              }
            }

            return <div />;
          }}
        </Query>
      </React.Fragment>
    );
  }
}
