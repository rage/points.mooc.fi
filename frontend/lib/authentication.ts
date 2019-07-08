import TmcClient from "tmc-client-js"
import Nexti18next from "../i18n"
import { NextContext } from "next"
import nookies from "nookies"
import { ApolloClient } from "apollo-boost"
import axios from "axios"
import { get } from "lodash"

const tmcClient = new TmcClient(
  "59a09eef080463f90f8c2f29fbf63014167d13580e1de3562e57b9e6e4515182",
  "2ddf92a15a31f87c1aabb712b7cfd1b88f3465465ec475811ccce6febb1bad28",
)

export const isSignedIn = (ctx: NextContext) => {
  const accessToken = nookies.get(ctx)["access_token"]
  return typeof accessToken == "string"
}

export const isAdmin = (ctx: NextContext) => {
  const admin = nookies.get(ctx)["admin"]
  return admin === "true"
}

export const signIn = async ({
  email,
  password,
}: {
  email: string
  password: string
}) => {
  const res = await tmcClient.authenticate({ username: email, password })

  const details = await userDetails(res.accessToken)
  document.cookie = `access_token=${res.accessToken};path=/`
  document.cookie = `admin=${details.administrator};path=/`
  const back = nookies.get()["redirect-back"]
  if (back) {
    Nexti18next.Router.push(back)
  }
  if (details.administrator) {
    Nexti18next.Router.push("/courses")
  } else {
    window.history.back()
  }
  return res
}

export const signOut = async (apollo: ApolloClient<any>) => {
  await apollo.resetStore().then(() => {
    document.cookie =
      "access_token" + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/"
    Nexti18next.Router.push("/sign-in")
  })
}

export const getAccessToken = (ctx: NextContext | undefined) => {
  // @ts-ignore
  return nookies.get(ctx)["access_token"]
}

export async function userDetails(accessToken: String) {
  const res = await axios.get(
    `https://tmc.mooc.fi/api/v8/users/current?show_user_fields=true`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
  return res.data
}
