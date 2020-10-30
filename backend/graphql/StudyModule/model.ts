import { objectType, arg, stringArg } from "@nexus/schema"
import { notEmpty } from "../../util/notEmpty"
import { filterNull } from "../../util/db-functions"

export const StudyModule = objectType({
  name: "StudyModule",
  definition(t) {
    t.model.id()
    t.model.created_at()
    t.model.image()
    t.model.name()
    t.model.order()
    t.model.slug()
    t.model.updated_at()
    t.model.study_module_translations()

    // @ts-ignore: false error
    t.string("description")

    t.list.field("courses", {
      type: "Course",
      args: {
        orderBy: arg({ type: "CourseOrderByInput" }),
        language: stringArg(),
      },
      resolve: async (parent, args, ctx) => {
        const { language, orderBy } = args

        const courses = await ctx.prisma.course.findMany({
          orderBy: filterNull(orderBy) ?? undefined,
          where: { study_modules: { some: { id: parent.id } } },
        })

        const values = language
          ? (
              await Promise.all(
                courses.map(async (course) => {
                  const course_translation = await ctx.prisma.courseTranslation.findFirst(
                    {
                      where: { course_id: course.id, language },
                    },
                  )

                  if (!course_translation) {
                    return Promise.resolve(null)
                  }

                  const { name, description, link = "" } = course_translation

                  return { ...course, name, description, link }
                }),
              )
            ).filter(notEmpty)
          : courses.map((course) => ({
              ...course,
              description: "",
              link: "",
            }))

        return values
      },
    })
  },
})
