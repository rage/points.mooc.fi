import * as React from "react"
import { AllEditorCourses } from "/static/types/generated/AllEditorCourses"
import { useQuery } from "@apollo/react-hooks"
import CourseGrid from "/components/CourseGrid"
import { WideContainer } from "/components/Container"
import styled from "styled-components"
import { H1Background } from "/components/Text/headers"
import { AllEditorCoursesQuery } from "/graphql/queries/courses"
import ModifiableErrorMessage from "/components/ModifiableErrorMessage"
import withSignedIn from "/lib/with-signed-in"
import withAdmin from "/lib/with-admin"

const Background = styled.section`
  background-color: #61baad;
`

const Courses = () => {
  const { loading, error, data } = useQuery<AllEditorCourses>(
    AllEditorCoursesQuery,
  )

  if (error) {
    return (
      <ModifiableErrorMessage
        errorMessage={JSON.stringify(error, undefined, 2)}
      />
    )
  }

  return (
    <Background>
      <WideContainer>
        <H1Background component="h1" variant="h1" align="center">
          All Courses
        </H1Background>
        <CourseGrid courses={data?.courses} loading={loading} />
      </WideContainer>
    </Background>
  )
}

Courses.displayName = "Courses"

export default withAdmin(withSignedIn(Courses))
