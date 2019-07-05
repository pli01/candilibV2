import { sendMailToAccount } from '../business/send-mail'
import {
  appLogger,
  codePostal,
  INSCRIPTION_OK,
  INSCRIPTION_UPDATE,
  VALIDATION_EMAIL,
} from '../../util'
import {
  createCandidat,
  deleteCandidat,
  findCandidatByEmail,
  findCandidatById,
  findCandidatByNomNeph,
  updateCandidatById,
  updateCandidatSignUp,
} from '../../models/candidat'
import { isMoreThan2HoursAgo } from '../admin/business/synchro-aurige'

const uuidv4 = require('uuid/v4')

export async function isAlreadyPresignedUp (candidatData) {
  const {
    adresse,
    codeNeph,
    email,
    nomNaissance,
    portable,
    prenom,
  } = candidatData

  const candidat = await findCandidatByNomNeph(nomNaissance, codeNeph)

  if (!candidat) {
    return {
      success: true,
    }
  }

  const {
    adresse: existCandidatAdresse,
    email: existCandidatEmail,
    isValidatedByAurige,
    isValidatedEmail,
    portable: existCandidatPortable,
    prenom: existCandidatPrenom,
    presignedUpAt,
  } = candidat

  if (isValidatedByAurige) {
    return {
      success: false,
      conflict: true,
      message:
        'Vous avez déjà un compte sur Candilib, veuillez cliquer sur le lien "Déjà inscrit"',
    }
  }

  if (!isValidatedEmail && isMoreThan2HoursAgo(presignedUpAt)) {
    await deleteCandidat(candidat, 'EMAIL_NOT_VERIFIED_EXPIRED')
    return { success: true }
  }

  if (
    isValidatedEmail ||
    (existCandidatEmail === email &&
      existCandidatPrenom === prenom &&
      existCandidatPortable === portable &&
      existCandidatAdresse === adresse)
  ) {
    return {
      success: false,
      conflict: true,
      message: `Vous êtes déjà pré-inscrit sur Candilib, votre compte est en cours de vérification par l'administration.`,
    }
  }

  if (existCandidatEmail !== email) {
    await deleteCandidat(
      candidat,
      'EMAIL_NOT_VERIFIED_AND_CANDIDAT_CHANGE_HIS_EMAIL'
    )
    return { success: true }
  }

  return { success: true, candidat }
}

export async function updateInfoCandidat (candidat, candidatData) {
  const updateCandidat = await updateCandidatSignUp(candidat, candidatData)

  if (updateCandidat) {
    if (updateCandidat.email === candidat.email) {
      try {
        const response = await sendMailToAccount(
          updateCandidat,
          INSCRIPTION_UPDATE
        )
        return {
          success: true,
          response,
          message:
            'Les modifications de vos informations ont bien été prises en compte. Veuillez consulter votre messagerie (pensez à vérifier dans vos courriers indésirables).',
          candidat: updateCandidat,
        }
      } catch (error) {
        return {
          success: false,
          message: error.message,
        }
      }
    }
    return {
      success: true,
      candidat: updateCandidat,
      message:
        'Les modifications de vos informations ont bien été prises en compte.',
    }
  }
  return {
    success: false,
    message: 'Échec de la mise à jour de votre compte',
  }
}

export async function presignUpCandidat (candidatData) {
  candidatData.emailValidationHash = uuidv4()

  const candidat = await createCandidat(candidatData)
  const response = await sendMailToAccount(candidat, VALIDATION_EMAIL)
  return {
    success: true,
    response,
    message: `Un email a été envoyé à ${candidatData.email}, veuillez consulter votre messagerie (pensez à vérifier dans vos courriers indésirables).`,
    candidat,
  }
}

export async function validateEmail (email, hash) {
  try {
    const candidat = await findCandidatByEmail(email)

    const updatedCandidat = await updateCandidatById(candidat._id, {
      isValidatedEmail: true,
      emailValidationHash: undefined,
      emailValidatedAt: new Date(),
    })

    if (candidat.emailValidationHash !== hash) {
      throw new Error('La validation de votre email a échouée.')
    }
    const response = await sendMailToAccount(candidat, INSCRIPTION_OK)
    return {
      success: true,
      response,
      message:
        'Votre email a été validé, veuillez consulter votre messagerie (pensez à vérifier dans vos courriers indésirables).',
      updatedCandidat,
    }
  } catch (error) {
    throw error
  }
}

export const getInfoCandidatDepartement = async id => {
  appLogger.debug('candidat-getInfoCandidatDepartement ' + id)

  const candidat = await findCandidatById(id, { adresse: 1 })
  if (!candidat) throw new Error('Candidat est introuvable')
  const { adresse } = candidat
  const codePostalResult = adresse.match(codePostal)
  return codePostalResult[1]
}
