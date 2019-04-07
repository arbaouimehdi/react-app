import React from "react";
import { Query } from "react-apollo";
import * as Cookies from "es-cookie";
import { gql } from "apollo-boost";

import { CURRENT_USER } from "../lib/queries";
import redirect from "../lib/redirect";

import Signin from "../pages/signin";

const withAuth = conditionFunc => Component => props => {
  return (
    <Query
      query={CURRENT_USER}
      onCompleted={data => {
        console.log(data);
      }}
      onError={error => {
        console.log(error);
      }}
    >
      {({ data, loading, error, refetch }) => {
        // If the User Token is Expired
        if (typeof document !== "undefined") {
          const tokenExpired = Cookies.get("token");

          if (tokenExpired == undefined) {
            refetch().then(r => {
              redirect({}, "/signin");
            });
          }
        }

        // If the Query return an error
        if (error) return <div>Query Error</div>;

        //
        if (data) {
          console.log(data);
          // If the Current User Exist
          return data.user ? (
            <Component {...props} user={data.user} />
          ) : (
            <Signin />
          );
        }
        return <div />;
      }}
    </Query>
  );
};

export default withAuth;
