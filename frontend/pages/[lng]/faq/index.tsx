import { ContentBox, SectionBox, FAQPage } from "/components/Home/FAQ/Common"
import { useFAQPage } from "/hooks/useFAQPage"

export default function FAQ() {
  const { Component, title, ingress, error, render } = useFAQPage("toc_faq")

  return FAQPage({
    title,
    ingress,
    error,
    content: (
      <>
        {render && !error ? <Component /> : null}
        {error ? (
          <ContentBox>
            <SectionBox>Could not load FAQ page.</SectionBox>
          </ContentBox>
        ) : null}
      </>
    ),
  })
}
