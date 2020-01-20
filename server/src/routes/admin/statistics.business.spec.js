import { connect, disconnect } from '../../mongo-connection'

import {
  countAbsentByCentres,
  countFailureByCentres,
  countNotExaminedByCentres,
  countSuccessByCentres,
  getResultsExamByDpt,
  getResultsExamAllDpt,
  getAllPlacesProposeInFutureByDpt,
} from './statistics.business'

import {
  countAbsent,
  countFailure,
  countNotExamined,
  countSuccess,
  createCandidatsForStat,
  createStatsForPlacesExam,
  dateReussitePratique,
  dateTimeDernierEchecPratique,
  dateTimeDernierEchecPratiqueWithPenalty,
  nowLuxon,
} from './__tests__/candidats-stat'

import {
  deleteCandidats,
  removeCentres,
  removePlaces,
} from '../../models/__tests__'

import { findCentresByDepartement } from '../../models/centre'

describe('test statistics', () => {
  beforeAll(async () => {
    await connect()
    await createCandidatsForStat()
    await createStatsForPlacesExam()
  })
  afterAll(async () => {
    await removePlaces()
    await removeCentres()
    await deleteCandidats()
    await disconnect()
  })
  it('Should have nb success', async () => {
    const centres = await findCentresByDepartement('92', { _id: 1 })
    const results = await countSuccessByCentres(
      centres.map(({ _id }) => _id),
      dateReussitePratique.toJSDate(),
      dateReussitePratique.toJSDate()
    )
    expect(results).toBeDefined()
    expect(results).toBe(
      countSuccess('92', dateReussitePratique, dateReussitePratique)
    )
  })

  it('Should have nb absent', async () => {
    const centres = await findCentresByDepartement('92', { _id: 1 })
    const begin = dateTimeDernierEchecPratiqueWithPenalty(45 * 3).toJSDate()
    const end = dateTimeDernierEchecPratique.toJSDate()

    const results = await countAbsentByCentres(centres.map(({ _id }) => _id))
    expect(results).toBeDefined()
    expect(results).toBe(countAbsent('92', begin, end))
  })
  it('Should have nb failure', async () => {
    const centres = await findCentresByDepartement('91', { _id: 1 })
    const results = await countFailureByCentres(
      centres.map(({ _id }) => _id),
      dateReussitePratique,
      dateReussitePratique
    )
    expect(results).toBeDefined()
    expect(results).toBe(countFailure('91'))
  })
  it('Should have nb not examined', async () => {
    const centres = await findCentresByDepartement('92', { _id: 1 })
    const begin = dateTimeDernierEchecPratiqueWithPenalty(45 * 3).toJSDate()
    const end = dateTimeDernierEchecPratique
    const results = await countNotExaminedByCentres(
      centres.map(({ _id }) => _id),
      begin,
      end.toJSDate()
    )
    expect(results).toBeDefined()
    expect(results).toBe(countNotExamined('92', begin, end))
  })
  it('Should have nb not examined, absent, received, failed', async () => {
    const begin = dateTimeDernierEchecPratiqueWithPenalty(45 * 3)
    const end = dateReussitePratique

    const result = await getResultsExamByDpt(
      '92',
      begin.toJSDate(),
      end.toJSDate()
    )
    expect(result).toBeDefined()
    expect(result).toHaveProperty(
      'notExamined',
      countNotExamined('92', begin, end)
    )
    expect(result).toHaveProperty('absent', countAbsent('92', begin, end))
    expect(result).toHaveProperty('failed', countFailure('92', begin, end))
    expect(result).toHaveProperty('received', countSuccess('92', begin, end))
  })
  it('Should have, for all departement, nb not examined, absent, received, failed', async () => {
    const begin = dateTimeDernierEchecPratiqueWithPenalty(45 * 3)
    const end = dateReussitePratique

    const results = await getResultsExamAllDpt(['91', '92'], begin, end)

    expect(results).toBeDefined()
    expect(results).toHaveLength(2)
    results.forEach(result => {
      expect(result).toHaveProperty('date')
      expect(result).toHaveProperty('departement')
      expect(result).toHaveProperty(
        'notExamined',
        countNotExamined(result.departement, begin, end)
      )
      expect(result).toHaveProperty(
        'absent',
        countAbsent(result.departement, begin, end)
      )
      expect(result).toHaveProperty(
        'received',
        countSuccess(result.departement, begin, end)
      )
      expect(result).toHaveProperty(
        'failed',
        countFailure(result.departement, begin, end)
      )
    })
  })
  it('Should have, stats in future with total subscript', async () => {
    const dateBeginPeriode = nowLuxon.startOf('day').toJSDate()
    const result = await getAllPlacesProposeInFutureByDpt(dateBeginPeriode)
    const shouldHaveThisResult = [
      {
        beginDate: dateBeginPeriode,
        departement: '92',
        totalBookedPlaces: 1,
        totalAvailablePlaces: 1,
        totalCandidatsInscrits: 1,
      },
      {
        beginDate: dateBeginPeriode,
        departement: '91',
        totalBookedPlaces: 0,
        totalAvailablePlaces: 0,
        totalCandidatsInscrits: 0,
      },
    ]

    expect(result).toEqual(expect.arrayContaining(shouldHaveThisResult))
  })
})
