// const sendResetPasswordEmail = gql`
// mutation sendResetPasswordEmail($email: String!) {
//   sendResetPasswordEmail(email: $email) {
//     result
//   }
// }
// `

import { fromEvent, FunctionEvent } from "graphcool-lib";
import { GraphQLClient } from "graphql-request";

// 1. Import npm modules
import * as fetch from "isomorphic-fetch";
import * as Base64 from "Base64";
import * as FormData from "form-data";

interface EventData {
  email: string;
}

interface User {
  id: string;
  email: string;
  accountActivated: string;
}

interface PasswordResetCode {
  id: string;
}

// 2. Mailgun data
const MAILGUN_API_KEY = process.env["MAILGUN_API_KEY"];
const MAILGUN_SUBDOMAIN = process.env["MAILGUN_SUBDOMAIN"];
const PASSWORD_RESET_URL = process.env["PASSWORD_RESET_URL"];

const apiKey = `api:${MAILGUN_API_KEY}`;
const mailgunUrl = `https://api.mailgun.net/v3/${MAILGUN_SUBDOMAIN}/messages`;

export default async (event: FunctionEvent<EventData>) => {
  try {
    // create simple api client
    const { email } = event.data;
    const api = fromEvent(event).api("simple/v1");

    // get user by email
    const user: User = await getUserByEmail(api, email).then(r => r.User);

    // no user with this email
    if (!user) {
      return {
        error: {
          message: "No User exist with this email",
        },
      };
    }

    // check if email has been verified
    if (!user.accountActivated) {
      return {
        error: {
          message: "Email not verified!",
        },
      };
    }

    const passwordResetCode: string = await createPasswordResetCode(
      api,
      user.id,
    );

    // no data with this response
    if (!passwordResetCode) {
      return {
        error: {
          message: "error on createPasswordResetCode",
        },
      };
    }

    const passwordResetUrl = `${PASSWORD_RESET_URL}?passwordResetCode=${passwordResetCode}`;

    // // 3. Prepare body of POST request
    const form = new FormData();
    form.append("from", `Team <mailgun@${MAILGUN_SUBDOMAIN}>`);
    form.append("to", `Email <${user.email}>`);
    form.append("subject", "Password reset link");
    form.append(
      "text",
      `A request to reset your password has been submitted. If this was not you please contact us immediately on support@youremail.com \n\n Please click on the following link to verify your email: ${passwordResetUrl}  \n\n Thank you! \n\nTeam`,
    );

    // // 4. Send request to Mailgun API
    const resultOfMailGunPost = await fetch(mailgunUrl, {
      headers: { Authorization: `Basic ${Base64.btoa(apiKey)}` },
      method: "POST",
      body: form,
    }).then(res => res);

    if (!resultOfMailGunPost) {
      return {
        error: {
          message: "Failed to send email",
        },
      };
    }

    return { data: { result: true } };

    // return resultOfMailGunPost;
  } catch (e) {
    console.log(e);
    return {
      error: {
        message:
          "An unexpected error occured during creation of passwordResetCode and sending the URL.",
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
        email
        accountActivated
      }
    }
  `;
  const variables = { email };
  return api.request<{ User }>(query, variables);
}

async function createPasswordResetCode(
  api: GraphQLClient,
  userId: string,
): Promise<string> {
  const mutation = `
    mutation createPasswordResetCode($userId: ID) {
      createPasswordResetCode(userId: $userId) {
        id
      }
    }
  `;
  const variables = { userId };
  return api
    .request<{ createPasswordResetCode: PasswordResetCode }>(
      mutation,
      variables,
    )
    .then(r => r.createPasswordResetCode.id);
}
