import gql from "graphql-tag";

import { CURRENT_USER } from "../lib/queries";

export default apolloClient =>
  apolloClient
    .query({
      query: CURRENT_USER,
    })
    .then(({ data }) => {
      if (data.user.accountActivated) {
        return { loggedInUser: data };
      }
      return { loggedInUser: {} };
    })
    .catch(() => {
      console.log("not logged in");
      // Fail gracefully
      return { loggedInUser: {} };
    });
