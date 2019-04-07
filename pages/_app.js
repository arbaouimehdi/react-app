import App, { Container } from "next/app";
import React from "react";
import { ApolloProvider } from "react-apollo";

// Main Style
import stylesheet from "../styles/main.scss";

// Librairies
import withApollo from "../lib/withApollo";

// Components
import Nav from "../components/Nav";

class MyApp extends App {
  render() {
    const { Component, pageProps, apolloClient } = this.props;

    return (
      <Container>
        <style
          dangerouslySetInnerHTML={{ __html: stylesheet.replace(/\n/g, "") }}
        />
        <ApolloProvider client={apolloClient}>
          <Nav />
          <main>
            <Component {...pageProps} query={this.props.router.query} />
          </main>
        </ApolloProvider>
      </Container>
    );
  }
}

export default withApollo(MyApp);
