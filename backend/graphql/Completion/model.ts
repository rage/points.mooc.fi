import { schema } from "nexus"
import { ForbiddenError } from "apollo-server-core"

schema.objectType({
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
    // we're not querying completion course languages for now, and this was buggy
    /*     t.field("course", {
      type: "Course",
      args: {
        language: schema.stringArg({ required: false }),
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
    t.field("user", {
      type: "User",
      resolve: async (parent, _, ctx) => {
        if (ctx.disableRelations) {
          throw new ForbiddenError(
            "Cannot query relations when asking for more than 50 objects",
          )
        }
        return ctx.db.completion.findOne({ where: { id: parent.id } }).user()
      },
    })

    t.field("completion_link", {
      type: "String",
      nullable: true,
      resolve: async (parent, _, ctx) => {
        const course = await ctx.db.completion
          .findOne({ where: { id: parent.id } })
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
        const avoinLinks = await ctx.db.openUniversityRegistrationLink.findMany(
          {
            where: filter,
          },
        )
        if (avoinLinks.length < 1) {
          return null
        }
        return avoinLinks[0].link
      },
    })

    t.field("registered", {
      type: "Boolean",
      resolve: async (parent, _, ctx) => {
        const registered = await ctx.db.completionRegistered.findMany({
          where: { completion_id: parent.id },
        })

        return registered.length > 0
      },
    })

    t.field("project_completion", {
      type: "Boolean",
      resolve: async (parent, _, ctx) => {
        if (!parent.course_id) {
          return false
        }

        const handlerCourse = await ctx.db.course
          .findOne({
            where: { id: parent.course_id },
          })
          .completions_handled_by()

        const progresses = await ctx.db.userCourseProgress.findMany({
          where: {
            course_id: handlerCourse?.id ?? parent.course_id,
            user_id: parent.user_id,
          },
        })

        return (
          progresses?.some((p) => (p?.extra as any)?.projectCompletion) ?? false
        )
      },
    })
  },
})
