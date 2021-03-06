import { useState } from "react"
import { gql, ApolloConsumer } from "@apollo/client"
import XLSX from "xlsx"
import styled from "@emotion/styled"
import {
  ExportUserCourseProgesses,
  ExportUserCourseProgesses_userCourseProgresses,
} from "/static/types/generated/ExportUserCourseProgesses"
import { ButtonWithPaddingAndMargin as StyledButton } from "/components/Buttons/ButtonWithPaddingAndMargin"
import { ApolloClient } from "@apollo/client"
const PointsExportButtonContainer = styled.div`
  margin-bottom: 1rem;
`

export interface PointsExportButtonProps {
  slug: string
}
function PointsExportButton(props: PointsExportButtonProps) {
  const { slug } = props

  const [infotext, setInfotext] = useState("")

  return (
    <ApolloConsumer>
      {(client) => (
        <PointsExportButtonContainer>
          <StyledButton
            color="secondary"
            disabled={!(infotext == "" || infotext == "ready")}
            onClick={async () => {
              try {
                setInfotext("Downloading data")
                const data = await dowloadInChunks(slug, client, setInfotext)
                setInfotext("constructing csv")
                let objects = await flatten(data)
                console.log(data)
                console.log(objects)
                const sheet = XLSX.utils.json_to_sheet(objects)
                console.log("sheet", sheet)
                const workbook: XLSX.WorkBook = {
                  SheetNames: [],
                  Sheets: {},
                }
                XLSX.utils.book_append_sheet(
                  workbook,
                  sheet,
                  "UserCourseProgress",
                )
                await XLSX.writeFile(workbook, slug + "-points.csv"),
                  { bookType: "csv", type: "string" }
                setInfotext("ready")
              } catch (e) {
                setInfotext(`Error: ${e}`)
              }
            }}
          >
            Export
          </StyledButton>
          {infotext}
        </PointsExportButtonContainer>
      )}
    </ApolloConsumer>
  )
}

async function flatten(data: ExportUserCourseProgesses_userCourseProgresses[]) {
  console.log("data in flatten", data)

  const newData = data.map((datum) => {
    const {
      upstream_id,
      first_name,
      last_name,
      email,
      student_number,
      real_student_number,
    } = datum?.user ?? {}
    const { course_variant, country, language } =
      datum?.user_course_settings ?? {}

    const newDatum: any = {
      user_id: upstream_id,
      first_name: first_name?.replace(/\s+/g, " ").trim() ?? "",
      last_name: last_name?.replace(/\s+/g, " ").trim() ?? "",
      email: email?.replace(/\s+/g, " ").trim() ?? "",
      student_number: student_number?.replace(/\s+/g, " ").trim() ?? "",
      confirmed_student_number:
        real_student_number?.replace(/\s+/g, " ").trim() ?? "",
      course_variant: course_variant?.replace(/\s+/g, " ").trim() ?? "",
      country: country?.replace(/\s+/g, " ").trim() ?? "",
      language: language?.replace(/\s+/g, " ").trim() ?? "",
      ...(datum?.progress?.reduce(
        (obj: any, progress: any) => ({
          ...obj,
          [progress.group]: progress.n_points,
        }),
        {},
      ) ?? {}),
    }
    return newDatum
  })
  return newData
}

async function dowloadInChunks(
  courseSlug: string,
  client: ApolloClient<object>,
  setMessage: any,
): Promise<ExportUserCourseProgesses_userCourseProgresses[]> {
  const res = []
  // let after: string | undefined = undefined
  let skip = 0

  while (1 === 1) {
    const { data } = await client.query<ExportUserCourseProgesses>({
      query: GET_DATA,
      variables: {
        course_slug: courseSlug,
        skip,
        take: 100,
        /*after: after, 
        first: 100*/
      },
    })
    let downloaded: any = data?.userCourseProgresses ?? []
    if (downloaded.length === 0) {
      break
    }
    //after = downloaded[downloaded.length - 1]?.id
    // console.log("After:", after)
    skip += downloaded.length
    console.log("Skip:", skip)

    const nDownLoaded = res.push(...downloaded)
    setMessage(`Downloaded progress for ${nDownLoaded} users...`)
  }
  return (res as unknown) as ExportUserCourseProgesses_userCourseProgresses[]
}

export default PointsExportButton

const GET_DATA = gql`
  query ExportUserCourseProgesses(
    $course_slug: String!
    $skip: Int
    $take: Int
  ) {
    userCourseProgresses(course_slug: $course_slug, skip: $skip, take: $take) {
      id
      user {
        id
        email
        student_number
        real_student_number
        upstream_id
        first_name
        last_name
      }
      progress
      user_course_settings {
        course_variant
        country
        language
      }
    }
  }
`
