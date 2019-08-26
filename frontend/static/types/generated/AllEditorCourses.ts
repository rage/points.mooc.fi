/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { CourseStatus } from "./globalTypes"

// ====================================================
// GraphQL query operation: AllEditorCourses
// ====================================================

export interface AllEditorCourses_courses_photo {
  __typename: "Image"
  id: any
  compressed: string | null
  uncompressed: string
}

export interface AllEditorCourses_courses {
  __typename: "Course"
  id: any
  name: string
  slug: string
  status: CourseStatus | null
  hidden: boolean | null
  photo: AllEditorCourses_courses_photo | null
}

export interface AllEditorCourses_currentUser {
  __typename: "User"
  id: any
  administrator: boolean
}

export interface AllEditorCourses {
  courses: AllEditorCourses_courses[]
  currentUser: AllEditorCourses_currentUser | null
}