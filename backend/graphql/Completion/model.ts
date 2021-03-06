import { ForbiddenError } from "apollo-server-core"
import { objectType } from "nexus"
import { UserCourseProgress } from "@prisma/client"

export const Completion = objectType({
  name: "Completion",
  definition(t) {
    t.model.id()
    t.model.created_at()
    t.model.updated_at()
    t.model.completion_language()
    t.model.email()
    t.model.student_number()
    t.model.user_upstream_id()
    t.model.completions_registered()
    t.model.course_id()
    t.model.grade()
    t.model.certificate_id()
    t.model.eligible_for_ects()
    t.model.course()
    t.model.completion_date()
    t.model.tier()

    // we're not querying completion course languages for now, and this was buggy
    /*     t.field("course", {
      type: "Course",
      args: {
        language: schema.nullable(stringArg()),
      },
      resolve: async (parent, args, ctx) => {
        const { language } = args
        const { prisma } = ctx

        const course = await prisma.course({ id: parent.course })

        if (language) {
          const course_translations = await prisma.courseTranslations({
            where: { course, language },
          })

          if (!course_translations.length) {
            return course
          }

          const { name = course.name, description } = course_translations[0]

          return { ...course, name, description }
        }

        return course
      },
    })
 */
    t.nullable.field("user", {
      type: "User",
      resolve: async (parent, _, ctx) => {
        if (ctx.disableRelations) {
          throw new ForbiddenError(
            "Cannot query relations when asking for more than 50 objects",
          )
        }
        const user = await ctx.prisma.completion
          .findUnique({ where: { id: parent.id } })
          .user()

        return user
      },
    })

    t.nullable.field("completion_link", {
      type: "String",
      resolve: async (parent, _, ctx) => {
        const course = await ctx.prisma.completion
          .findUnique({ where: { id: parent.id } })
          .course()

        if (!course) {
          throw new Error("course not found")
        }

        let filter
        if (
          !parent.completion_language ||
          parent.completion_language === "unknown"
        ) {
          filter = {
            course_id: course.id,
          }
        } else {
          filter = {
            course_id: course.id,
            language: parent.completion_language,
          }
        }
        const avoinLink = await ctx.prisma.openUniversityRegistrationLink.findFirst(
          {
            where: filter,
          },
        )

        return avoinLink?.link ?? null
      },
    })

    t.field("registered", {
      type: "Boolean",
      resolve: async (parent, _, ctx) => {
        const registered = await ctx.prisma.completionRegistered.findFirst({
          where: { completion_id: parent.id },
        })

        return Boolean(registered)
      },
    })

    t.field("project_completion", {
      type: "Boolean",
      resolve: async (parent, _, ctx) => {
        if (!parent.course_id) {
          return false
        }

        const handlerCourse = await ctx.prisma.course
          .findUnique({
            where: { id: parent.course_id },
          })
          .completions_handled_by()

        const progresses = await ctx.prisma.userCourseProgress.findMany({
          where: {
            course_id: handlerCourse?.id ?? parent.course_id,
            user_id: parent.user_id,
          },
        })

        return (
          progresses?.some(
            (p: UserCourseProgress) => (p?.extra as any)?.projectCompletion,
          ) ?? false
        )
      },
    })
  },
})
