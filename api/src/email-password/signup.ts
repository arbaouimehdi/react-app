import { fromEvent, FunctionEvent } from "graphcool-lib";
import { GraphQLClient } from "graphql-request";
import * as bcrypt from "bcryptjs";
import * as validator from "validator";

import { capitalize } from "../helper/helpers";

interface User {
  id: string;
  name: string;
  email: string;
}

interface EventData {
  name: string;
  email: string;
  password: string;
}

const SALT_ROUNDS = 10;

export default async (event: FunctionEvent<EventData>) => {
  console.log(event);

  try {
    const graphcool = fromEvent(event);
    const api = graphcool.api("simple/v1");

    const { name, email, password } = event.data;
    const error_messages = {
      name: [],
      email: [],
      password: [],
    };

    if (
      // name - alphabet only
      !validator.isAlpha(name.replace(" ", "")) ||
      // name - between 4 & 20 characters
      !validator.isLength(name, { min: 4, max: 20 }) ||
      // email - not empty
      validator.isEmpty(email) ||
      // email - valid email & alphanumeric
      !validator.isEmail(validator.escape(email)) ||
      // password - between 4 and 10
      !validator.isLength(password, { min: 6, max: 10 })
    ) {
      return {
        error: {
          message: "Signup Failed",
        },
      };
    }

    // check if user exists already
    const userExists: boolean = await getUser(api, email).then(
      r => r.User !== null,
    );
    if (userExists) {
      return {
        error: {
          message: "Email already in use",
        },
      };
    }

    // create password hash
    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);

    // create new user
    const userId = await createGraphcoolUser(
      api,
      capitalize(name),
      email,
      hash,
    );

    // generate node token for new User node
    const token = await graphcool.generateNodeToken(userId, "User");

    return { data: { id: userId, token, name, email } };
  } catch (e) {
    console.log(e);
    return {
      error: {
        message: "An unexpected error occured during signup.",
      },
    };
  }
};

async function getUser(api: GraphQLClient, email: string): Promise<{ User }> {
  const query = `
    query getUser($email: String!) {
      User(email: $email) {
        id
      }
    }
  `;

  const variables = {
    email,
  };

  return api.request<{ User }>(query, variables);
}

async function createGraphcoolUser(
  api: GraphQLClient,
  name: string,
  email: string,
  password: string,
): Promise<string> {
  const mutation = `
    mutation createGraphcoolUser($name: String!, $email: String!, $password: String!) {
      createUser(
        name: $name
        email: $email,
        password: $password
      ) {
        id
        name
        email
      }
    }
  `;

  const variables = {
    name,
    email,
    password: password,
  };

  return api
    .request<{ createUser: User }>(mutation, variables)
    .then(r => r.createUser.id);
}