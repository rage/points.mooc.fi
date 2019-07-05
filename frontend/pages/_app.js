import React from "react"
import App, { Container } from "next/app"
import Router from "next/router"
import * as gtag from "../lib/gtag"
import Head from "next/head"
import { MuiThemeProvider } from "@material-ui/core/styles"
import { StylesProvider } from "@material-ui/styles"
import CssBaseline from "@material-ui/core/CssBaseline"
import { ApolloProvider } from "react-apollo"
import { ApolloProvider as ApolloHooksProvider } from "react-apollo-hooks"
import Layout from "./_layout"
import { isSignedIn, isAdmin } from "../lib/authentication"
import LoginStateContext from "../contexes/LoginStateContext"
import UserDetailContext from "../contexes/UserDetailContext"
import withApolloClient from "../lib/with-apollo-client"
import NextI18Next from "../i18n"
import theme from "../src/theme"
import OpenSansCondensed from "typeface-open-sans-condensed"
import Roboto from "typeface-roboto"
import "@fortawesome/fontawesome-svg-core/styles.css"
import { config as fontAwesomeConfig } from "@fortawesome/fontawesome-svg-core"

fontAwesomeConfig.autoAddCss = false
Router.events.on("routeChangeComplete", url => gtag.pageview(url))

class MyApp extends App {
  componentDidMount() {
    const jssStyles = document.querySelector("#jss-server-side")
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles)
    }
  }

  render() {
    const { Component, pageProps, apollo } = this.props

    return (
      <Container>
        <Head>
          <title>Points</title>
        </Head>
        <StylesProvider injectFirst>
          <MuiThemeProvider theme={theme}>
            <CssBaseline />

            <ApolloProvider client={apollo}>
              <ApolloHooksProvider client={apollo}>
                <LoginStateContext.Provider value={this.props.signedIn}>
                  <UserDetailContext.Provider value={this.props.admin}>
                    <Layout>
                      <Component {...pageProps} />
                    </Layout>
                  </UserDetailContext.Provider>
                </LoginStateContext.Provider>
              </ApolloHooksProvider>
            </ApolloProvider>
          </MuiThemeProvider>
        </StylesProvider>
      </Container>
    )
  }
}

// We're probably not supposed to do this
const originalGetIntialProps = MyApp.getInitialProps

MyApp.getInitialProps = async arg => {
  const { ctx } = arg

  let originalProps = {}

  if (originalGetIntialProps) {
    originalProps = (await originalGetIntialProps(arg)) || {}
  }

  return {
    ...originalProps,
    signedIn: isSignedIn(ctx),
    admin: isAdmin(ctx),
  }
}

const withTranslation = NextI18Next.appWithTranslation(MyApp)

export default withApolloClient(withTranslation)
