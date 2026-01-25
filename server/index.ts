import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { initSocketServer } from './socket'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)
const socketPort = parseInt(process.env.SOCKET_PORT || '3001', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Socket.io 서버 (별도 포트)
  const socketServer = createServer()
  initSocketServer(socketServer)
  socketServer.listen(socketPort, () => {
    console.log(`> Socket.io server running on http://${hostname}:${socketPort}`)
  })

  // Next.js 서버
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  httpServer.listen(port, () => {
    console.log(`> Next.js ready on http://${hostname}:${port}`)
    console.log(`> Environment: ${dev ? 'development' : 'production'}`)
  })
})
