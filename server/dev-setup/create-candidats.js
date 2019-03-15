import { createCandidat } from '../src/models/candidat'

import { simpleLogger as logger } from '../src/util'

import candidats from './candidats'

logger.info('Creating candidats')

export default async () => {
  const candidatsCreated = candidats.map(candidat =>
    createCandidat(candidat)
      .then(() => {
        logger.info(`Compte candidat ${candidat.codeNeph} créé !`)
      })
      .catch(error => logger.error(error))
  )
  return Promise.all(candidatsCreated)
}
