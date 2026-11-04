import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'


const apiRoutes: Record<string, string> = {
  '/api/content': '/api/content.ts',
  '/api/admin-login': '/api/admin-login.ts',
  '/api/admin-content': '/api/admin-content.ts',
  '/api/admin-logout': '/api/admin-logout.ts',
  '/api/admin-projects': '/api/admin-projects.ts',
  '/api/admin-session': '/api/admin-session.ts',
  '/api/profile-image': '/api/profile-image.ts',
  '/api/logo-image': '/api/logo-image.ts',
}

function apiDevPlugin(): Plugin {
  return {
    name: 'portfolio-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req: any, res: any, next) => {
        const requestUrl = new URL(req.url || '/', 'http://localhost')
        const modulePath = apiRoutes[requestUrl.pathname]

        if (!modulePath) {
          next()
          return
        }

        try {
          req.query = Object.fromEntries(requestUrl.searchParams.entries())
          req.body = undefined

          if (req.method && !['GET', 'HEAD'].includes(req.method)) {
            const chunks: Buffer[] = []

            for await (const chunk of req) {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
            }

            const rawBody = Buffer.concat(chunks).toString('utf8')

            if (rawBody) {
              const contentType = String(req.headers['content-type'] || '')
              req.body = contentType.includes('application/json') ? JSON.parse(rawBody) : rawBody
            }
          }

          res.status = (statusCode: number) => {
            res.statusCode = statusCode
            return res
          }

          res.json = (body: unknown) => {
            if (!res.headersSent) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
            }
            res.end(JSON.stringify(body))
            return res
          }

          res.send = (body: unknown) => {
            if (Buffer.isBuffer(body) || body instanceof Uint8Array) {
              res.end(body)
              return res
            }

            if (body !== null && typeof body === 'object') {
              if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8')
              }
              res.end(JSON.stringify(body))
              return res
            }

            res.end(body == null ? '' : String(body))
            return res
          }

          const module = await server.ssrLoadModule(modulePath)
          await module.default(req, res)
        } catch (error) {
          console.error(`${req.method} ${requestUrl.pathname}`, error)

          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
          }

          if (!res.writableEnded) {
            res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno.' }))
          }
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }

  return {
    plugins: [apiDevPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '5173'),
    },
    preview: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '4173'),
    },
  }
})
