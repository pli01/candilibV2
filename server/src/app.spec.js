const request = require('supertest')

const app = require('./app')

describe('Test the root path', () => {
  it('Should response the GET method', async () => {
    const response = await request(app)
      .post('/api/admin/login')
      .expect(200)
    expect(response.body).toBeDefined()
    expect(response.body.login).toBe(true)
  })
})
