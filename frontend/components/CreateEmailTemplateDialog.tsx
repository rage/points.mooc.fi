import { ApolloClient, ApolloConsumer, gql, useQuery } from "@apollo/client"
import { useContext, useState } from "react"
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  InputLabel,
  NativeSelect,
} from "@material-ui/core"
import { AddEmailTemplateMutation } from "/graphql/mutations/email-templates"
import { AddEmailTemplate } from "/static/types/generated/AddEmailTemplate"
import Router from "next/router"
import LanguageContext from "/contexts/LanguageContext"
import CustomSnackbar from "/components/CustomSnackbar"
import { updateCourse } from "/static/types/generated/updateCourse"
import { UpdateCourseMutation } from "/graphql/mutations/courses"
import { CourseDetailsFromSlugQuery_course as CourseDetailsData } from "/static/types/generated/CourseDetailsFromSlugQuery"
import omit from "lodash/omit"
import Spinner from "/components/Spinner"

export const AllCoursesDetails = gql`
  query AllCoursesDetails {
    courses {
      id
      slug
      name
      teacher_in_charge_name
      teacher_in_charge_email
      start_date
      completion_email {
        name
        id
      }
    }
  }
`

interface CreateEmailTemplateDialogParams {
  course?: CourseDetailsData
  buttonText: string
}

const CreateEmailTemplateDialog = ({
  course,
  buttonText,
}: CreateEmailTemplateDialogParams) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [nameInput, setNameInput] = useState("")
  const [templateType, setTemplateType] = useState("completion")
  const [selectedCourse, setSelectedCourse] = useState<
    CourseDetailsData | undefined
  >(undefined)
  const [isErrorSnackbarOpen, setIsErrorSnackbarOpen] = useState(false)
  const { language } = useContext(LanguageContext)
  const { loading, error, data } = useQuery<{ courses: CourseDetailsData[] }>(
    AllCoursesDetails,
  )

  if (loading) {
    return <Spinner />
  }
  //TODO fix error messages
  if (error || !data) {
    return <p>Error has occurred</p>
  }

  const handleDialogClickOpen = () => {
    setOpenDialog(true)
  }

  const handleDialogClose = () => {
    setOpenDialog(false)
  }

  const courseOptions =
    templateType === "completion"
      ? data.courses
          .filter((c) => c?.completion_email === null)
          .map((c, i) => {
            return (
              <option key={i} value={i}>
                {c?.name}
              </option>
            )
          })
      : data.courses.map((c, i) => {
          return (
            <option key={i} value={i}>
              {c?.name}
            </option>
          )
        })

  const handleCreate = async (client: ApolloClient<object>) => {
    try {
      const { data } = await client.mutate<AddEmailTemplate>({
        mutation: AddEmailTemplateMutation,
        variables: {
          name: nameInput,
          template_type: templateType,
          triggered_automatically_by_course_id:
            templateType === "threshold" ? selectedCourse?.id : null,
        },
      })
      if ((course || selectedCourse) && templateType === "completion") {
        await client.mutate<updateCourse>({
          mutation: UpdateCourseMutation,
          variables: {
            course: {
              ...omit(course ?? selectedCourse, "__typename", "id"),
              completion_email: data?.addEmailTemplate?.id,
            },
          },
        })
      }
      const url =
        "/" + language + "/email-templates/" + data?.addEmailTemplate?.id
      Router.push(url)
    } catch {
      setIsErrorSnackbarOpen(true)
    }
  }

  return (
    <div>
      <Button color="primary" onClick={handleDialogClickOpen}>
        {buttonText}
      </Button>
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Create</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Name your new Email Template. This will create new Email Template
            and you will be redirected to editing page.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          {/* If we end up from course edit dashboard here, we have course and we know it
          is a completion type. Could be refactored to own Dialog */}
          {!course && (
            <>
              <InputLabel htmlFor="select">Template type</InputLabel>
              <NativeSelect
                onChange={(e) => {
                  e.preventDefault()
                  setTemplateType(e.target.value)
                }}
                id="selectType"
                value={templateType}
              >
                <option value="completion">Completion e-mail</option>
                <option value="threshold">Threshold e-mail</option>
              </NativeSelect>
              <br />
              <br />
              <InputLabel htmlFor="selectCourse">For course</InputLabel>
              <NativeSelect
                onChange={(e) => {
                  e.preventDefault()
                  setSelectedCourse(data.courses[Number(e.target.value)])
                }}
                id="selectCourse"
                defaultValue="Select course"
              >
                <option value="Select course">Select...</option>
                {courseOptions}
              </NativeSelect>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <ApolloConsumer>
            {(client) => (
              <Button onClick={() => handleCreate(client)} color="primary">
                Create
              </Button>
            )}
          </ApolloConsumer>
        </DialogActions>
      </Dialog>
      <CustomSnackbar
        open={isErrorSnackbarOpen}
        setOpen={setIsErrorSnackbarOpen}
        type="error"
        message="Error in creating a new EmailTemplate, see console"
      />
    </div>
  )
}

export default CreateEmailTemplateDialog
