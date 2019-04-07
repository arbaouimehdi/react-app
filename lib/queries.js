import gql from "graphql-tag";

export const ACTIVATION_CODE = gql`
  query checkActivation($activationCode: ID!) {
    AccountActivationCode(id: $activationCode) {
      user {
        accountActivated
      }
    }
  }
`;

export const CURRENT_USER = gql`
  query {
    user {
      id
      name
      email
      accountActivated
    }
  }
`;

export const PASSWORD_RESET_CODE = gql`
  query PasswordResetCode($activationCodeID: ID!) {
    PasswordResetCode(id: $activationCodeID) {
      id
      user {
        email
      }
    }
  }
`;

export const SIGN_IN = gql`
  mutation authenticateUser($email: String!, $password: String!) {
    authenticateUser(email: $email, password: $password) {
      token
    }
  }
`;

export const CREATE_USER = gql`
  mutation Create($name: String!, $email: String!, $password: String!) {
    signupUser(name: $name, email: $email, password: $password) {
      id
      token
      name
      email
    }
  }
`;

export const SEND_CONFIRMATION = gql`
  mutation SendConfirmation(
    $userId: ID!
    $userName: String!
    $userEmail: String!
  ) {
    sendAccountActivationEmail(
      id: $userId
      name: $userName
      email: $userEmail
    ) {
      result
    }
  }
`;

export const SEND_RESET_PASSWORD = gql`
  mutation sendResetPassword($userEmail: String!) {
    sendResetPasswordEmail(email: $userEmail) {
      result
    }
  }
`;

export const ACTIVATE_ACCOUNT = gql`
  mutation ActivateAccount($activationCode: ID!) {
    activateAccount(id: $activationCode) {
      result
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation resetPassword($passwordResetCode: ID!) {
    resetPassword(id: $passwordResetCode) {
      result
    }
  }
`;

export const UPDATE_USER_INFOS = gql`
  mutation updateUserInfos(
    $token: String!
    $newName: String!
    $oldPassword: String
    $newPassword: String
  ) {
    updateUserInfos(
      token: $token
      newName: $newName
      oldPassword: $oldPassword
      newPassword: $newPassword
    ) {
      name
    }
  }
`;
