import api from '@/api'
import { DateTime } from 'luxon'
import { SHOW_ERROR } from './message'

export const FETCH_CENTERS_REQUEST = 'FETCH_CENTERS_REQUEST'
export const FETCH_CENTERS_SUCCESS = 'FETCH_CENTERS_SUCCESS'
export const FETCH_CENTERS_FAILURE = 'FETCH_CENTERS_FAILURE'

export const FETCH_CENTER_REQUEST = 'FETCH_CENTER_REQUEST'
export const FETCH_CENTER_SUCCESS = 'FETCH_CENTER_SUCCESS'
export const FETCH_CENTER_FAILURE = 'FETCH_CENTER_FAILURE'

export const SELECT_CENTER = 'SELECT_CENTER'

const zipCodeRegexFromAdresse = /.*([0-9]{2})[0-9]{3}.*/

export default {
  state: {
    isFetchingCenters: false,
    isFetchingCenter: false,
    list: [],
    selected: undefined,
  },
  mutations: {
    [FETCH_CENTERS_REQUEST] (state) {
      state.isFetchingCenters = true
    },
    [FETCH_CENTERS_SUCCESS] (state, centers) {
      state.isFetchingCenters = false
      state.list = centers
    },
    [FETCH_CENTERS_FAILURE] (state) {
      state.isFetchingCenters = false
    },
    [SELECT_CENTER] (state, selected) {
      state.selected = selected
    },
    [FETCH_CENTER_REQUEST] (state) {
      state.isFetchingCenter = true
    },
    [FETCH_CENTER_SUCCESS] (state, selected) {
      state.isFetchingCenter = false
      state.selected = selected
    },
    [FETCH_CENTER_FAILURE] (state) {
      state.isFetchingCenter = false
    },
  },
  actions: {
    async [FETCH_CENTERS_REQUEST] ({ commit, dispatch }, adresseCandidat) {
      commit(FETCH_CENTERS_REQUEST)
      try {
        const end = DateTime.local().plus({ month: 3 }).endOf('month').toISO()
        const [, departement] = adresseCandidat.match(zipCodeRegexFromAdresse)
        const result = await api.candidat.getCentres(departement, end)
        commit(FETCH_CENTERS_SUCCESS, result)
      } catch (error) {
        commit(FETCH_CENTERS_FAILURE, error.message)
        dispatch(SHOW_ERROR, error.message)
      }
    },

    [SELECT_CENTER] ({ commit }, center) {
      commit(SELECT_CENTER, center)
    },

    async [FETCH_CENTER_REQUEST] ({ commit, dispatch }, { departement, nom }) {
      commit(FETCH_CENTER_REQUEST)
      try {
        const result = await api.candidat.getCentre(departement, nom)
        commit(FETCH_CENTER_SUCCESS, result)
      } catch (error) {
        commit(FETCH_CENTER_FAILURE, error.message)
        dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}