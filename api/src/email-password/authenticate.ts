import { fromEvent, FunctionEvent } from "graphcool-lib";
import { GraphQLClient } from "graphql-request";
import * as bcrypt from "bcryptjs";
import * as validator from "validator";

interface User {
  id: string;
  password: string;
  accountActivated: boolean;
}

interface EventData {
  email: string;
  password: string;
}

export default async (event: FunctionEvent<EventData>) => {
  try {
    const graphcool = fromEvent(event);
    const api = graphcool.api("simple/v1");

    const { email, password } = event.data;

    // check if the email is valid
    if (!validator.isEmail(email)) {
      return {
        error: {
          message: "Not a valid Email",
        },
      };
    }

    // get user by email
    const user: User = await getUserByEmail(api, email).then(r => r.User);

    // no user with this email
    if (!user) {
      return {
        error: {
          message: "Incorrect username or password.",
        },
      };
    }

    // check password
    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    if (!passwordIsCorrect) {
      return {
        error: {
          message:
            "Wrong password. Try again or click Forgot password to reset it!",
        },
      };
    }

    // check activation
    if (!user.accountActivated) {
      return {
        error: {
          message:
            "The account is not activated, please check your email for the activation url",
        },
      };
    }

    // generate node token for existing User node
    const token = await graphcool.generateNodeToken(user.id, "User");

    return { data: { id: user.id, token } };
  } catch (e) {
    console.log(e);
    return {
      error: {
        message: "An unexpected error occured during authentication.",
      },
    };
  }
};

async function getUserByEmail(
  api: GraphQLClient,
  email: string,
): Promise<{ User }> {
  const query = `
    query getUserByEmail($email: String!) {
      User(email: $email) {
        id
        password
        accountActivated
      }
    }
  `;

  const variables = {
    email,
  };

  return api.request<{ User }>(query, variables);
}
