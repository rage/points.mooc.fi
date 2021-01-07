import * as Yup from "yup"
import { CourseStatus } from "/static/types/generated/globalTypes"
import {
  CourseFormValues,
  CourseTranslationFormValues,
  CourseVariantFormValues,
  CourseAliasFormValues,
  UserCourseSettingsVisibilityFormValues,
} from "./types"
import { ApolloClient, DocumentNode } from "@apollo/client"
import { FormValues } from "/components/Dashboard/Editor/types"
import { DateTime } from "luxon"
import { CourseDetails_course_open_university_registration_links } from "/static/types/generated/CourseDetails"

export const initialTranslation: CourseTranslationFormValues = {
  _id: undefined,
  language: "",
  name: "",
  description: "",
  link: "",
  open_university_course_link: {
    course_code: "",
    link: "",
  } as CourseDetails_course_open_university_registration_links,
}

export const initialVariant: CourseVariantFormValues = {
  _id: undefined,
  slug: "",
  description: "",
}

export const initialAlias: CourseAliasFormValues = {
  _id: undefined,
  course_code: "",
}

export const initialValues: CourseFormValues = {
  id: null,
  name: "",
  slug: "",
  new_slug: "",
  ects: "",
  teacher_in_charge_name: "",
  teacher_in_charge_email: "",
  support_email: "",
  start_date: "",
  end_date: "",
  thumbnail: undefined,
  photo: undefined,
  new_photo: undefined,
  base64: false,
  start_point: false,
  promote: false,
  hidden: false,
  study_module_start_point: false,
  status: CourseStatus.Upcoming,
  study_modules: {},
  course_translations: [],
  open_university_registration_links: [],
  order: undefined,
  study_module_order: undefined,
  course_variants: [],
  course_aliases: [],
  delete_photo: false,
  has_certificate: false,
  user_course_settings_visibilities: [],
  upcoming_active_link: false,
  tier: undefined,
  automatic_completions: undefined,
  automatic_completions_eligible_for_ects: undefined,
  exercise_completions_needed: undefined,
  points_needed: undefined,
}

export const initialVisibility: UserCourseSettingsVisibilityFormValues = {
  _id: undefined,
  language: "",
  course: undefined,
}

export const statuses = (t: Function) => [
  {
    value: CourseStatus.Upcoming,
    label: t("courseUpcoming"),
  },
  {
    value: CourseStatus.Active,
    label: t("courseActive"),
  },
  {
    value: CourseStatus.Ended,
    label: t("courseEnded"),
  },
]

export const languages = (t: Function) => [
  {
    value: "fi_FI",
    label: t("courseFinnish"),
  },
  {
    value: "en_US",
    label: t("courseEnglish"),
  },
  {
    value: "sv_SE",
    label: t("courseSwedish"),
  },
]

export const study_modules: { value: any; label: any }[] = []

const testUnique = <T extends FormValues>(
  valueField: keyof CourseFormValues,
  getter: (values: T) => any
  // field: keyof T
) => function (this: Yup.TestContext, value?: any): boolean {
  const {
    context,
    path,
  }: { context?: any; path?: string | undefined } = this.options

  if (!context) {
    return true
  }

  const fieldValues = (context.values as CourseFormValues)[valueField]

  if (!value || value === "" || !Array.isArray(fieldValues)) {
    return true // previous should have caught the empty
  }

  const currentIndexMatch = (path || "").match(/^.*\[(\d+)\].*$/) || []
  const currentIndex =
    currentIndexMatch.length > 1 ? Number(currentIndexMatch[1]) : -1
  const otherValues = ((fieldValues as unknown) as T[])
    .filter(
      (c: T, index: number) =>
        getter(c) !== "" && index !== currentIndex,
    )
    .map((c: T) => getter(c))

  return otherValues.indexOf(value) === -1
}

const courseEditSchema = ({
  client,
  checkSlug,
  initialSlug,
  t,
}: {
  client: ApolloClient<object>
  checkSlug: DocumentNode
  initialSlug: string | null
  t: (key: any) => string
}) => {

  return Yup.object().shape({
    name: Yup.string().required(t("validationRequired")),
    new_slug: Yup.string()
      .required(t("validationRequired"))
      .trim()
      .matches(/^[^\/\\\s]*$/, t("validationNoSpacesSlashes"))
      .test(
        "unique",
        t("validationSlugInUse"),
        validateSlug({ client, checkSlug, initialSlug }),
      ),
    status: Yup.mixed()
      .oneOf(statuses(t).map((s) => s.value))
      .required(t("validationRequired")),
    course_translations: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required(t("validationRequired")),
        language: Yup.string()
          .required(t("validationRequired"))
          .oneOf(
            languages(t).map((l) => l.value),
            t("validationValidLanguageCode"),
          )
          .test(
            "unique",
            t("validationOneTranslation"),
            testUnique<CourseTranslationFormValues>(
              "course_translations",
              (value) => value.language
            ),
          ),
        description: Yup.string(),
        link: Yup.string(),
        open_university_course_link: Yup.object().shape({
          course_code: Yup.string(),
          link: Yup.string().url(t("validationValidUrl")).nullable(),
        }),
      }),
    ),
    course_variants: Yup.array().of(
      Yup.object().shape({
        slug: Yup.string()
          .required(t("validationRequired"))
          .trim()
          .matches(/^[^\/\\\s]*$/, t("validationNoSpacesSlashes"))
          .test(
            "unique",
            t("validationTwoVariants"),
            testUnique<CourseVariantFormValues>("course_variants", (v) => v.slug),
          ),
        description: Yup.string(),
      }),
    ),
    course_aliases: Yup.array().of(
      Yup.object().shape({
        course_code: Yup.string()
          .required(t("validationRequired"))
          .trim()
          .matches(/^[^\/\\\s]*$/, t("validationNoSpacesSlashes"))
          .test(
            "unique",
            t("validationTwoAliases"),
            testUnique<CourseAliasFormValues>("course_aliases", (v) => v.course_code),
          ),
      }),
    ),
    order: Yup.number()
      .transform((value) => (isNaN(value) ? undefined : Number(value)))
      .integer(t("validationInteger")),
    study_module_order: Yup.number()
      .transform((value) => (isNaN(value) ? undefined : Number(value)))
      .integer(t("validationInteger")),
    ects: Yup.string().matches(
      /(^\d+(\-\d+)?$|^$)/,
      t("validationNumberRange"),
    ),
    start_date: Yup.date()
      .typeError(t("courseStartDateRequired"))
      .required(t("courseStartDateRequired"))
      .transform(
        (datetime?: string | DateTime) =>
          new Date(
            (datetime instanceof DateTime ? datetime.toISO() : datetime) ?? "",
          ),
      )
      .test(
        "start_before_end",
        t("courseStartDateLaterThanEndDate"),
        function (this: Yup.TestContext, value?: Date | null) {
          const start = value
          const end = this.parent.end_date

          return start && end ? start <= end : true
        },
      ),
    teacher_in_charge_name: Yup.string().required(
      t("courseTeacherNameRequired"),
    ),
    teacher_in_charge_email: Yup.string()
      .email(t("courseEmailInvalid"))
      .required(t("courseTeacherEmailRequired")),
    support_email: Yup.string().email(t("courseEmailInvalid")),
    exercise_completions_needed: Yup.number()
      .transform((value) => (isNaN(value) ? undefined : Number(value)))
      .positive(),
    points_needed: Yup.number()
      .transform((value) => (isNaN(value) ? undefined : Number(value)))
      .positive(),
  })
}
const validateSlug = ({
  checkSlug,
  client,
  initialSlug,
}: {
  checkSlug: DocumentNode
  client: ApolloClient<object>
  initialSlug: string | null
}) =>
  async function (
    this: Yup.TestContext,
    value?: string | null,
  ): Promise<boolean> {
    if (!value || value === "") {
      return true // if it's empty, it's ok by this validation and required will catch it
    }

    if (value === initialSlug) {
      return true
    }

    try {
      const { data } = await client.query({
        query: checkSlug,
        variables: { slug: value },
      })

      const existing = data.course_exists

      return !existing
    } catch (e) {
      return true
    }
  }

export default courseEditSchema