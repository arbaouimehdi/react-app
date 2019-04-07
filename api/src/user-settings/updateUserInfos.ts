import { fromEvent, FunctionEvent } from "graphcool-lib";
import { GraphQLClient } from "graphql-request";
import * as bcrypt from "bcryptjs";
import * as validator from "validator";

// Query Parameters
interface EventData {
  token: string;
  newName: string;
  oldPassword: string;
  newPassword: string;
}

interface UpdatedUser {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

interface LoggedInUser {
  id: string;
}

const SALT_ROUNDS = 10;

export default async (event: FunctionEvent<EventData>) => {
  console.log(event);

  try {
    let updatedUser: UpdatedUser = {
      id: "",
      name: "",
    };
    const { token, newName, oldPassword, newPassword } = event.data;

    const graphcool = fromEvent(event);
    const api = graphcool.api("simple/v1", { token });

    // check if the token is defined
    if (!token) {
      return {
        error: {
          message: "token is not defined",
        },
      };
    }

    // Get the logged in user
    const loggedInUser: LoggedInUser = await getLoggedInUserID(api).then(
      r => r.loggedInUser,
    );

    // check if the token belong to a user
    if (!loggedInUser) {
      return {
        error: {
          message: "No User Exist using this token",
        },
      };
    }

    // get user by id
    const user: User = await getUserByID(api, loggedInUser.id).then(
      r => r.User,
    );

    /**
     *
     * Update Name Only
     *
     */

    // Check the name field
    if (
      // newName - alphabet only
      !validator.isAlpha(newName.replace(" ", "")) ||
      // newName - between 4 & 20 characters
      !validator.isLength(newName, { min: 4, max: 20 })
    ) {
      return {
        error: {
          message: "Update Name Failed",
        },
      };
    }

    // update the name
    if (oldPassword == "" && newPassword == "") {
      updatedUser = await updateUser(api, user.id, newName);

      // Return the updated Infos
      return {
        data: {
          name: updatedUser.name,
        },
      };
    }

    if (
      // between 4 and 10 characters
      !validator.isLength(oldPassword, { min: 6, max: 10 }) ||
      !validator.isLength(newPassword, { min: 6, max: 10 })
    ) {
      return {
        error: {
          message: "Update Password Failed",
        },
      };
    }

    /**
     *
     * Update Password
     *
     */

    // get user current password
    const currentPassword = user.password;

    // Check if the Old Password is similar to the Current Password
    if (!bcrypt.compareSync(oldPassword, currentPassword)) {
      return {
        error: {
          message: "The Current Password is Wrong",
        },
      };
    }

    // Check if the New Password is Equal to the Current Password
    if (bcrypt.compareSync(newPassword, currentPassword)) {
      return {
        error: {
          message: "The New Password is similar to the Old password",
        },
      };
    }

    // create password hash
    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    const hash = await bcrypt.hash(newPassword, salt);

    // update the password
    updatedUser = await updateUser(api, user.id, newName, hash);

    // Return the updated Infos
    return {
      data: {
        name: updatedUser.name,
      },
    };
  } catch (e) {
    console.log(e);
    return {
      error: {
        message: "An unexpected error occured during the update user infos.",
      },
    };
  }
};

async function getUserByID(api: GraphQLClient, id: string): Promise<{ User }> {
  const query = `
    query getUserByID($id: ID!) {
      User(id: $id) {
        id
        name
        email
        password
      }
    }
  `;
  const variables = {
    id,
  };

  return api.request<{ User }>(query, variables);
}

async function getLoggedInUserID(api: GraphQLClient): Promise<any> {
  const query = `
    query {
      loggedInUser {
        id
    }
  }
  `;

  return api.request<{ LoggedInUser }>(query);
}

async function updateUser(
  api: GraphQLClient,
  loggedInUserID: string,
  newName: string,
  newPassword?: string,
): Promise<UpdatedUser> {
  const mutation = `
    mutation updateUser($loggedInUserID: ID!, $newName: String!, $newPassword: String) {
      updateUser(id: $loggedInUserID, name: $newName, password: $newPassword) {
        name
      }
    }
  `;
  const variables = {
    loggedInUserID,
    newName,
    newPassword,
  };

  return api
    .request<{ updateUser: UpdatedUser }>(mutation, variables)
    .then(r => r.updateUser);
}
