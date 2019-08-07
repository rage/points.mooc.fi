/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: UserEmailContains
// ====================================================

export interface UserEmailContains_userEmailContains_pageInfo {
  __typename: "PageInfo"
  startCursor: string | null
  endCursor: string | null
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface UserEmailContains_userEmailContains_edges_node {
  __typename: "User"
  id: any
  email: string
  student_number: string | null
  real_student_number: string | null
  upstream_id: number
  first_name: string | null
  last_name: string | null
}

export interface UserEmailContains_userEmailContains_edges {
  __typename: "UserEdge"
  node: UserEmailContains_userEmailContains_edges_node
}

export interface UserEmailContains_userEmailContains {
  __typename: "UserConnection"
  pageInfo: UserEmailContains_userEmailContains_pageInfo
  edges: UserEmailContains_userEmailContains_edges[]
  count: number
}

export interface UserEmailContains {
  userEmailContains: UserEmailContains_userEmailContains
}

export interface UserEmailContainsVariables {
  email: string
  before?: string | null
  after?: string | null
  first?: number | null
  last?: number | null
}