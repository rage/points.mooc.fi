import styled from "@emotion/styled"
import SignUpTranslations from "/translations/sign-up"
import { useTranslator } from "/util/useTranslator"

const InfoBox = styled.div`
  margin-bottom: 2rem;
`

const FormContainer = styled.div`
  height: 100%;
  margin-top: 2rem;
`

export interface ConfirmEmailProps {
  onComplete: Function
}

// @ts-ignore: onComplete function not used at the moment
const ConfirmEmail = (props: ConfirmEmailProps) => {
  const t = useTranslator(SignUpTranslations)

  return (
    <FormContainer>
      <h1>{t("confirmEmailTitle")}</h1>
      <InfoBox>
        <p>{t("confirmEmailInfo")}</p>
      </InfoBox>
    </FormContainer>
  )
}

export default ConfirmEmail
