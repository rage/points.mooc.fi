/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Organizations
// ====================================================

export interface Organizations_organizations_organization_translations {
  __typename: "OrganizationTranslation"
  language: string
  name: string
  information: string | null
}

export interface Organizations_organizations {
  __typename: "Organization"
  id: any
  slug: string
  organization_translations:
    | Organizations_organizations_organization_translations[]
    | null
}

export interface Organizations {
  organizations: Organizations_organizations[]
}