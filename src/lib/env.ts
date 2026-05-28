import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  BLOB_READ_WRITE_TOKEN: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email().default('noreply@tracitai.com'),
  OPENAI_API_KEY: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_REGION: z.string().default('us-west-2'),
  BEDROCK_MODEL_LITE: z.string().default('amazon.nova-lite-v1:0'),
  BEDROCK_MODEL_PRO: z.string().default('amazon.nova-pro-v1:0'),
  MODAL_TOKEN_ID: z.string().min(1),
  MODAL_TOKEN_SECRET: z.string().min(1),
  MODAL_CALLBACK_SECRET: z.string().min(1),
  GOLF_INTELLIGENCE_API_KEY: z.string().min(1),
  GOLF_INTELLIGENCE_BASE_URL: z.string().url().default('https://api.golfintelligence.com'),
  APP_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
export type Env = z.infer<typeof envSchema>
