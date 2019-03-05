import request from 'supertest'
import { connect, disconnect } from '../../mongo-connection'
import {
  createCentres,
  createPlaces,
  removePlaces,
  removeCentres,
  centres,
  nbPlacesByCentres,
} from '../../models/__tests__'
import { ErrorMsgArgEmpty } from './places.controllers'
const { default: app, apiPrefix } = require('../../app')

jest.mock('../middlewares/verify-token')

describe('Test places controllers', () => {
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
    await app.close()
  })

  describe('Test get dates from places available', () => {
    beforeAll(async () => {
      await createCentres()
      await createPlaces()
    })

    afterAll(async () => {
      await removePlaces()
      await removeCentres()
    })

    it('should get 400 when there are not information centre', async () => {
      const { body } = await request(app)
        .get(`${apiPrefix}/candidat/places`)
        .send()
        .set('Accept', 'application/json')
        .expect(500)

      expect(body).toBeDefined()
      expect(body).toHaveProperty('success', false)
      expect(body).toHaveProperty('message', ErrorMsgArgEmpty)
    })

    it('Should get 200 with 2 dates from places Centre 2', async () => {
      const centreSelected = centres[1]
      const { body } = await request(app)
        .get(
          `${apiPrefix}/candidat/places?departement=${
            centreSelected.departement
          }&centre=${centreSelected.nom}`
        )
        .send()
        .set('Accept', 'application/json')
        .expect(200)

      expect(body).toBeDefined()
      expect(body).toHaveLength(nbPlacesByCentres(centreSelected))
    })
  })
})
