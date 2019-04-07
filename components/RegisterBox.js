import React from "react";
import { Mutation, withApollo } from "react-apollo";
import cookie from "cookie";
import { isEmail, isLength } from "validator";

import { CREATE_USER, SEND_CONFIRMATION } from "../lib/queries";

import SendConfirmationBox from "../components/SendConfirmationBox";

class RegisterBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      createAccountStatus: "NOT CREATED",
      userId: "",
      userName: "",
      userEmail: "",
      formErrors: {
        email: {
          isEmail: false,
        },
        name: {
          isLength: false,
        },
        password: {
          isLength: false,
        },
      },
    };
  }

  handleError = error => {
    console.log(error);
  };

  handleChangeName = e => {
    this.setState({
      createAccountStatus: this.state.createAccountStatus,
      userId: this.state.userId,
      userName: this.state.userName,
      userEmail: this.state.userEmail,
      formErrors: {
        email: {
          isEmail: this.state.formErrors.email.isEmail,
        },
        name: {
          isLength: isLength(e.target.value, { min: 4, max: 20 }),
        },
        password: {
          isLength: this.state.formErrors.password.isLength,
        },
      },
    });
  };

  handleChangeEmail = e => {
    this.setState({
      createAccountStatus: this.state.createAccountStatus,
      userId: this.state.userId,
      userName: this.state.userName,
      userEmail: this.state.userEmail,
      formErrors: {
        email: {
          isEmail: isEmail(e.target.value),
        },
        name: {
          isLength: this.state.formErrors.name.isLength,
        },
        password: {
          isLength: this.state.formErrors.password.isLength,
        },
      },
    });
  };

  handleChangePassword = e => {
    this.setState({
      createAccountStatus: this.state.createAccountStatus,
      userId: this.state.userId,
      userName: this.state.userName,
      userEmail: this.state.userEmail,
      formErrors: {
        email: {
          isEmail: this.state.formErrors.email.isEmail,
        },
        name: {
          isLength: this.state.formErrors.name.isLength,
        },
        password: {
          isLength: isLength(e.target.value, { min: 6, max: 20 }),
        },
      },
    });
  };

  render() {
    let name, email, password;

    if (this.state.createAccountStatus === "NOT CREATED") {
      return (
        <Mutation
          mutation={CREATE_USER}
          onCompleted={data => {
            document.cookie = cookie.serialize("token", data.signupUser.token, {
              maxAge: 30 * 24 * 60 * 60, // 30 days
            });

            this.setState({
              createAccountStatus: "CREATED",
              userId: data.signupUser.id,
              userName: data.signupUser.name,
              userEmail: data.signupUser.email,
            });
          }}
          onError={error => {
            this.handleError(error);
          }}
        >
          {(create, { loading, error, data }) => (
            <div className="authForm">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  e.stopPropagation();

                  create({
                    variables: {
                      name: name.value,
                      email: email.value,
                      password: password.value,
                    },
                  });

                  // name.value = email.value = password.value = "";
                }}
              >
                {loading && <div>Loading</div>}

                {error &&
                  error.graphQLErrors.map(({ functionError }, index) => (
                    <div className="Alert Alert--error" key={`error-${index}`}>
                      {functionError.message}
                    </div>
                  ))}
                <div>
                  <label htmlFor="name">Name</label>
                  <input
                    name="name"
                    ref={node => {
                      name = node;
                    }}
                    type="text"
                    className="Input Input-Text"
                    onChange={this.handleChangeName}
                    required
                  />
                  <small>Use at least 4 characters</small>
                </div>
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
                  <small>Use a valid email (eg: john@domain.com)</small>
                </div>
                <div>
                  <label htmlFor="password">Password</label>
                  <input
                    name="password"
                    ref={node => {
                      password = node;
                    }}
                    type="password"
                    className="Input Input-Text"
                    onChange={this.handleChangePassword}
                    required
                  />
                  <small>Use at least 6 and maximum 10 characters</small>
                </div>
                <div>
                  <button
                    className="Btn Btn--primary"
                    disabled={
                      this.state.formErrors.email.isEmail &&
                      this.state.formErrors.name.isLength &&
                      this.state.formErrors.password.isLength
                        ? false
                        : true
                    }
                  >
                    Register
                  </button>
                </div>
              </form>
            </div>
          )}
        </Mutation>
      );
    }

    if (this.state.createAccountStatus === "CREATED") {
      return (
        <Mutation
          mutation={SEND_CONFIRMATION}
          variables={{
            userId: this.state.userId,
            userName: this.state.userName,
            userEmail: this.state.userEmail,
          }}
          onError={error => {
            this.handleError(error);
          }}
        >
          {(sendConfirmationCode, { loading, error }) => (
            <SendConfirmationBox sendConfirmationCode={sendConfirmationCode} />
          )}
        </Mutation>
      );
    }
  }
}

export default withApollo(RegisterBox);
