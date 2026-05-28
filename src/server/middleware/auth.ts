import type { VercelRequest, VercelResponse } from '@vercel/node'
import jwt from 'jsonwebtoken'

export type AuthenticatedRequest = VercelRequest & {
  user: {
    id: string
    email: string
    role: 'admin' | 'user'
  }
}

type Handler = (req: AuthenticatedRequest, res: VercelResponse) => Promise<void> | void

function extractToken(req: VercelRequest): string | null {
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return null
}

export function withAuth(handler: Handler) {
  return async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    const token = extractToken(req)
    if (!token) {
      res.status(401).json({ error: 'Unauthorized', code: 'MISSING_TOKEN' })
      return
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
        sub: string
        email: string
        role: 'admin' | 'user'
      }
      const authedReq = req as AuthenticatedRequest
      authedReq.user = { id: payload.sub, email: payload.email, role: payload.role }
      await handler(authedReq, res)
    } catch {
      res.status(401).json({ error: 'Unauthorized', code: 'INVALID_TOKEN' })
    }
  }
}

export function withAdmin(handler: Handler) {
  return withAuth(async (req: AuthenticatedRequest, res: VercelResponse) => {
    if (req.user.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden', code: 'ADMIN_REQUIRED' })
      return
    }
    await handler(req, res)
  })
}
