import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses"
import { envConfig } from "~/constants/config"
import fs from "fs"
import path from "path"

const verify_email_template = fs.readFileSync(path.resolve("src/templates/verify-email.html"), "utf-8")

interface SendEmailParams {
  fromAddress: string
  toAddresses: string | string[]
  ccAddresses?: string | string[]
  body: string
  subject: string
  replyToAddresses?: string | string[]
}

// Create SES service object.
const sesClient = new SESClient({
  region: envConfig.AWS_REGION,
  credentials: {
    secretAccessKey: envConfig.AWS_SECRET_ACCESS_KEY,
    accessKeyId: envConfig.AWS_ACCESS_KEY_ID,
  },
})

const createSendEmailCommand = ({ fromAddress, toAddresses, ccAddresses = [], body, subject, replyToAddresses = [] }: SendEmailParams) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: "UTF-8",
          Data: body,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses],
  })
}

export const sendEmail = async (toAddress: string, subject: string, body: string) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: envConfig.SES_FROM_ADDRESS,
    toAddresses: toAddress,
    body,
    subject,
  })

  return await sesClient.send(sendEmailCommand)
}

export const sendVerifyEmail = async (toAddress: string, token: string) => {
  return sendEmail(
    toAddress,
    "Verify your email",
    verify_email_template
      .replace("{{user_email}}", toAddress)
      .replace("{{verify_email_url}}", `${envConfig.CLIENT_URL}/verify-email?token=${token}`),
  )
}
