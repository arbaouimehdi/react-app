import React, { Component } from "react";
import { Query, Mutation, withApollo } from "react-apollo";
import { isLength } from "validator";

import { CURRENT_USER, UPDATE_USER_INFOS } from "../lib/queries";

class UpdateUserInfosBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      oldPassword: "",
      newPassword: "",
      email: "",
      formErrors: {
        name: {
          isLength: true,
        },
        oldPassword: {
          isLength: true,
        },
        newPassword: {
          isLength: true,
        },
      },
    };
  }

  onChangeName = e => {
    this.setState({
      name: e.target.value,
      formErrors: {
        name: {
          isLength: isLength(e.target.value, { min: 4, max: 20 }),
        },
        oldPassword: {
          isLength: this.state.formErrors.oldPassword.isLength,
        },
        newPassword: {
          isLength: this.state.formErrors.newPassword.isLength,
        },
      },
    });
  };

  render() {
    let name, oldPassword, newPassword;

    return (
      <Query query={CURRENT_USER}>
        {({ data, loading, error }) => {
          if (loading) return <div>loading</div>;

          if (error) return console.log(error);

          if (data) {
            let { user } = data;

            return (
              <Mutation
                mutation={UPDATE_USER_INFOS}
                update={(cache, { data: { updateUserInfos } }) => {
                  let { user } = cache.readQuery({ query: CURRENT_USER });
                  console.log(updateUserInfos.name);
                  cache.writeQuery({
                    query: CURRENT_USER,
                    data: {
                      user: {
                        id: user.id,
                        name: updateUserInfos.name,
                        email: user.email,
                        accountActivated: user.accountActivated,
                        __typename: "UpdateUserInfosPayload",
                      },
                    },
                  });
                }}
              >
                {(updateUserInfos, { loading, error, data }) => {
                  return (
                    <div className="authForm">
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          e.stopPropagation();

                          updateUserInfos({
                            variables: {
                              token: document.cookie.replace("token=", ""),
                              newName: name.value,
                              oldPassword: oldPassword.value,
                              newPassword: newPassword.value,
                            },
                          });
                        }}
                      >
                        {loading && <div>Loading</div>}

                        {error &&
                          error.graphQLErrors.map(
                            ({ functionError }, index) => (
                              <div
                                className="Alert Alert--error"
                                key={`error-${index}`}
                              >
                                {functionError.message}
                              </div>
                            ),
                          )}

                        {/* Updated Successfully */}
                        {data && (
                          <div className="Alert Alert--success">
                            Updated Successfully
                          </div>
                        )}

                        <div>
                          <label htmlFor="name">Name</label>
                          <input
                            type="text"
                            name="name"
                            ref={node => {
                              name = node;
                            }}
                            className="Input Input-Text"
                            defaultValue={user.name}
                            onChange={this.onChangeName}
                          />
                          <small>Use at least 4 characters</small>
                        </div>
                        <div>
                          <label htmlFor="oldPassword">Old Password</label>
                          <input
                            type="password"
                            name="oldPassword"
                            ref={node => {
                              oldPassword = node;
                            }}
                            className="Input Input-Text"
                          />
                          <small>
                            Use at least 6 and maximum 10 characters
                          </small>
                        </div>
                        <div>
                          <label htmlFor="newPassword">New Password</label>
                          <input
                            type="password"
                            name="newPassword"
                            ref={node => {
                              newPassword = node;
                            }}
                            className="Input Input-Text"
                          />
                          <small>
                            Use at least 6 and maximum 10 characters
                          </small>
                        </div>
                        <div>
                          <label htmlFor="email">Email</label>
                          <input
                            type="email"
                            name="email"
                            className="Input Input-Text Input-Text--disabled"
                            defaultValue={user.email}
                            disabled
                          />
                        </div>
                        <div>
                          <button
                            className="Btn Btn--primary"
                            disabled={
                              this.state.formErrors.name.isLength &&
                              this.state.formErrors.oldPassword.isLength
                                ? false
                                : true
                            }
                          >
                            Update
                          </button>
                        </div>
                      </form>
                    </div>
                  );
                }}
              </Mutation>
            );
          }
        }}
      </Query>
    );
  }
}

export default withApollo(UpdateUserInfosBox);
