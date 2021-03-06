import { memo } from "react"
import styled from "@emotion/styled"
import { addDomain } from "/util/imageUtils"
import { AllCourses_courses_photo } from "/static/types/generated/AllCourses"
import { Typography } from "@material-ui/core"

const ComponentStyle = `
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const ImageComponent = styled.img`
  ${ComponentStyle}
`
const PlaceholderComponent = styled.div`
  ${ComponentStyle}
  background-color: #F0F0F0;
  display: flex;
  justify-content: center;
  align-items: center;
`
interface CourseImageProps {
  photo?: AllCourses_courses_photo | null
  [k: string]: any
}

const CourseImage = memo((props: CourseImageProps) => {
  const { photo, ...rest } = props

  return (
    <picture>
      {photo ? (
        <>
          <source srcSet={addDomain(photo.compressed)} type="image/webp" />
          <source srcSet={addDomain(photo.uncompressed)} type="image/png" />
          <ImageComponent
            src={addDomain(photo.uncompressed)}
            {...rest}
            alt=""
          />
        </>
      ) : (
        <PlaceholderComponent>
          <Typography variant="h3">no image</Typography>
        </PlaceholderComponent>
      )}
    </picture>
  )
})

export default CourseImage
