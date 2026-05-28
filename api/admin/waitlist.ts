import { withAdmin } from '@/server/middleware/auth'

export default withAdmin(async (_req, res) => {
  res.status(501).json({ error: 'Not implemented', code: 'NOT_IMPLEMENTED' })
})
