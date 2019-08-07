import React from "react"
import { Typography, Paper } from "@material-ui/core"
import { NextPageContext as NextContext } from "next"
import { isSignedIn, isAdmin } from "../../../lib/authentication"
import redirect from "../../../lib/redirect"
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"
import AdminError from "../../../components/Dashboard/AdminError"
import { WideContainer } from "../../../components/Container"
import Editor from "../../../components/Dashboard/Editor"
import { withRouter, SingletonRouter } from "next/router"
import { useQuery } from "react-apollo-hooks"
import { gql } from "apollo-boost"
import NextI18Next from "../../../i18n"
import Spinner from "/components/Spinner"

// import { Courses as courseData } from "../courseData.js"

export const CourseQuery = gql`
  query CourseDetails($slug: String) {
    course(slug: $slug) {
      id
      name
      slug
      order
      photo {
        id
        compressed
        compressed_mimetype
        uncompressed
        uncompressed_mimetype
      }
      promote
      start_point
      hidden
      status
      course_translations {
        id
        name
        language
        description
        link
      }
      open_university_registration_links {
        id
        course_code
        language
        link
      }
      study_modules {
        id
      }
    }
  }
`

export const StudyModuleQuery = gql`
  query StudyModules {
    study_modules {
      id
      name
      slug
    }
  }
`

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      marginTop: "1em",
    },
    paper: {
      padding: "1em",
    },
  }),
)

interface EditCourseProps {
  router: SingletonRouter
  admin: boolean
  nameSpacesRequired: string[]
  language: string
}

const EditCourse = (props: EditCourseProps) => {
  const { admin, router, language } = props
  const slug = router.query.id

  const classes = useStyles()

  let redirectTimeout: number | null = null

  // use mock data
  /*   const data = { course: Courses.allcourses.find(c => c.slug === slug) }
  const loading = false */

  const {
    data: courseData,
    loading: courseLoading,
    error: courseError,
  } = useQuery(CourseQuery, {
    variables: { slug: slug },
  })
  const {
    data: studyModulesData,
    loading: studyModulesLoading,
    error: studyModulesError,
  } = useQuery(StudyModuleQuery)

  if (!admin) {
    return <AdminError />
  }

  if (courseLoading || studyModulesLoading) {
    return <Spinner />
  }

  const listLink = `${language ? "/" + language : ""}/courses`

  if (!courseData.course) {
    redirectTimeout = setTimeout(() => router.push(listLink), 5000)
  }

  return (
    <section>
      <WideContainer>
        <Typography
          component="h1"
          variant="h2"
          gutterBottom={true}
          align="center"
          className={classes.header}
        >
          Edit course
        </Typography>
        {courseData.course ? (
          <Editor
            type="Course"
            course={courseData.course}
            modules={studyModulesData.study_modules}
          />
        ) : (
          <Paper className={classes.paper} elevation={2}>
            <Typography variant="body1">
              Course with id <b>{slug}</b> not found!
            </Typography>
            <Typography variant="body2">
              You will be redirected back to the course list in 5 seconds -
              press{" "}
              <NextI18Next.Link href={listLink}>
                <a
                  onClick={() =>
                    redirectTimeout && clearTimeout(redirectTimeout)
                  }
                  href={listLink}
                >
                  here
                </a>
              </NextI18Next.Link>{" "}
              to go there now.
            </Typography>
          </Paper>
        )}
      </WideContainer>
    </section>
  )
}

EditCourse.getInitialProps = function(context: NextContext) {
  const admin = isAdmin(context)
  if (!isSignedIn(context)) {
    redirect(context, "/sign-in")
  }
  return {
    admin,
    // @ts-ignore
    language: context.req.language,
    namespacesRequired: ["common"],
  }
}

export default withRouter(EditCourse)