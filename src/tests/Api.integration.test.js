import request from 'supertest'
import express from 'express'

// simple app
const createApp = () => {
  const app = express()
  app.use(express.json())

  app.get('/sessions', (_, res) => {
    res.json({ sessions: [{ id: '1', created_at: new Date().toISOString(), chart_type: 'bar', query: 'demo' }] })
  })

  app.get('/session/:id', (req, res) => {
    res.json({ id: req.params.id, visualizations: [] })
  })

  return app
}

describe('Local integration – Express API', () => {
  const app = createApp()

  it('GET /sessions', async () => {
    const res = await request(app).get('/sessions').expect(200)
    expect(res.body.sessions).toHaveLength(1)
  })

  it('GET /session/:id', async () => {
    const res = await request(app).get('/session/abc').expect(200)
    expect(res.body.id).toBe('abc')
  })
})
