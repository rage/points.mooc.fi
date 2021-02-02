import React, { Fragment } from "react"
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document"
import flush from "styled-jsx/server"
import { ServerStyleSheets } from "@material-ui/styles"
import theme from "../src/theme"
import { ServerStyleSheet } from "styled-components"
import { cache } from "./_app"
import { fontCss } from "/src/fonts"
import createEmotionServer from "@emotion/server/create-instance"
import { style } from "@material-ui/system"

const { extractCritical } = createEmotionServer(cache)

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheets = new ServerStyleSheets()
    const sheet = new ServerStyleSheet()

    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) => {
            const MuiStylesDataWrapper = sheets.collect(<App {...props} />)

            const styledComponentsDataWrapper = sheet.collectStyles(
              MuiStylesDataWrapper,
            )
            return styledComponentsDataWrapper
          },
        })

      const initialProps = await Document.getInitialProps(ctx)
      const styles = extractCritical(initialProps.html)

      return {
        ...initialProps,

        // if we were to use GlobalStyles, we'd insert them here - or _app before <Head> ?
        styles: [
          <style dangerouslySetInnerHTML={{ __html: fontCss }} />,
          ...React.Children.toArray(initialProps.styles),
          sheets.getStyleElement(),
          sheet.getStyleElement(),
          <style
            key="emotion-style-tag"
            data-emotion={`css ${styles.ids.join(" ")}`}
            dangerouslySetInnerHTML={{ __html: styles.css }}
          />,
          flush(),
        ],
        /*        styles: (
          <Fragment>
            {initialProps.styles}
            {sheets.getStyleElement()}
            {sheet.getStyleElement()}
            {flush() || null}
          </Fragment>
        ),*/
      }
    } finally {
      sheet.seal()
    }
  }

  render() {
    return (
      <Html lang="fi" dir="ltr">
        <Head>
          <meta charSet="utf-8" />
          <meta name="theme-color" content={theme.palette.primary.main} />
          <link
            rel="shortcut icon"
            type="image/x-icon"
            href="/static/favicon.ico"
          />
          {/*<style dangerouslySetInnerHTML={{ __html: fontCss }} />*/}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
