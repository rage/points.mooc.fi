import { CourseFormValues } from "/components/Dashboard/Editor/Course/types"
import { FieldArray, getIn, useFormikContext } from "formik"
import { Grid, FormControl, FormGroup, Typography } from "@material-ui/core"
import { initialVariant } from "./form-validation"
import AddIcon from "@material-ui/icons/Add"
import RemoveIcon from "@material-ui/icons/Remove"
import {
  StyledTextField,
  StyledFieldWithAnchor,
  inputLabelProps,
} from "/components/Dashboard/Editor/common"

import { ButtonWithPaddingAndMargin as StyledButton } from "/components/Buttons/ButtonWithPaddingAndMargin"
import styled from "@emotion/styled"
import CoursesTranslations from "/translations/courses"
import { useConfirm } from "material-ui-confirm"
import { useTranslator } from "/util/useTranslator"

const ButtonWithWhiteText = styled(StyledButton)`
  color: white;
`

const CourseVariantEditForm = () => {
  const {
    values: { course_variants: values },
    errors: { course_variants: errors },
    isSubmitting,
  } = useFormikContext<CourseFormValues>()

  const t = useTranslator(CoursesTranslations)
  const confirm = useConfirm()

  return (
    <section>
      <Grid item xs={12}>
        <FormControl>
          <FormGroup>
            <FieldArray name="course_variants">
              {(helpers) => (
                <>
                  {values!.length ? (
                    values!.map((variant, index: number) => (
                      <Grid container spacing={2} key={`variant-${index}`}>
                        <Grid item xs={4}>
                          <StyledFieldWithAnchor
                            id={`course_variants[${index}].slug`}
                            name={`course_variants[${index}].slug`}
                            type="text"
                            component={StyledTextField}
                            value={variant.slug}
                            label={t("courseSlug")}
                            errors={[getIn(errors, `[${index}].slug`)]}
                            variant="outlined"
                            InputLabelProps={inputLabelProps}
                            required
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <StyledFieldWithAnchor
                            id={`course_variants[${index}].description`}
                            name={`course_variants[${index}].description`}
                            type="text"
                            component={StyledTextField}
                            value={variant.description}
                            label={t("courseDescription")}
                            errors={[getIn(errors, `[${index}].description`)]}
                            variant="outlined"
                            InputLabelProps={inputLabelProps}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <StyledFieldWithAnchor
                            id={`course_variants[${index}].instructions`}
                            name={`course_variants[${index}].instructions`}
                            type="text"
                            component={StyledTextField}
                            value={variant.instructions}
                            label={t("courseInstructions")}
                            errors={[getIn(errors, `[${index}].instructions`)]}
                            variant="outlined"
                            InputLabelProps={inputLabelProps}
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <Grid
                            container
                            justifyItems="flex-end"
                            alignItems="center"
                          >
                            <StyledButton
                              style={{ margin: "auto" }}
                              variant="contained"
                              disabled={isSubmitting}
                              color="secondary"
                              onClick={() => {
                                if (!variant.id && variant.slug === "") {
                                  helpers.remove(index)
                                } else {
                                  return confirm({
                                    title: t("confirmationAreYouSure"),
                                    description: t("confirmationRemoveVariant"),
                                    confirmationText: t("confirmationYes"),
                                    cancellationText: t("confirmationNo"),
                                  })
                                    .then(() => helpers.remove(index))
                                    .catch(() => {})
                                }
                              }}
                              endIcon={
                                <RemoveIcon>{t("courseRemove")}</RemoveIcon>
                              }
                            >
                              {t("courseRemove")}
                            </StyledButton>
                          </Grid>
                        </Grid>
                      </Grid>
                    ))
                  ) : (
                    <Typography
                      variant="h3"
                      component="p"
                      align="center"
                      gutterBottom={true}
                    >
                      {t("courseNoVariants")}
                    </Typography>
                  )}
                  {(values!.length == 0 ||
                    (values!.length &&
                      values![values!.length - 1].slug !== "")) && (
                    <Grid container justifyItems="center">
                      <ButtonWithWhiteText
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                        onClick={() => helpers.push({ ...initialVariant })}
                        endIcon={<AddIcon>{t("courseAdd")}</AddIcon>}
                        style={{ width: "45%" }}
                      >
                        {t("courseAdd")}
                      </ButtonWithWhiteText>
                    </Grid>
                  )}
                </>
              )}
            </FieldArray>
          </FormGroup>
        </FormControl>
      </Grid>
    </section>
  )
}

export default CourseVariantEditForm
