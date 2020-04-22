// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import 'cypress-file-upload'
import './mailHogCommands'

Cypress.Commands.add('adminLogin', () => {
  cy.visit(Cypress.env('frontAdmin') + 'admin-login')
  cy.get('.t-login-email [type=text]')
    .type(Cypress.env('adminLogin'))
  cy.get('[type=password]')
    .type(Cypress.env('adminPass'))
  cy.get('.submit-btn')
    .click()
  cy.url()
    .should('not.contain', '/admin-login')
    .should('contain', '/admin')
})

Cypress.Commands.add('adminDisconnection', () => {
  cy.get('.home-link')
    .click()
  cy.get('.t-disconnect')
    .click()
  cy.url()
    .should('contain', '/admin-login')
})

Cypress.Commands.add('archiveCandidate', (candidat) => {
  // Creates the aurige file
  cy.writeFile(Cypress.env('filePath') + '/aurige.end.json',
    [
      {
        codeNeph: candidat ? candidat.codeNeph : Cypress.env('NEPH'),
        nomNaissance: candidat ? candidat.nomNaissance : Cypress.env('candidat'),
        email: candidat ? candidat.email : Cypress.env('emailCandidat'),
        dateReussiteETG: '',
        nbEchecsPratiques: '',
        dateDernierNonReussite: '',
        objetDernierNonReussite: '',
        reussitePratique: '',
        candidatExistant: 'NOK',
      },
    ])
  // Archives the candidate
  cy.contains('import_export')
    .click()
  const filePath = '../../../' + Cypress.env('filePath') + '/aurige.end.json'
  const fileName = 'aurige.json'
  cy.fixture(filePath).then(fileContent => {
    cy.get('.input-file-container [type=file]')
      .upload({
        fileContent: JSON.stringify(fileContent),
        fileName,
        mimeType: 'application/json',
      })
  })
  cy.get('.v-snack--active')
    .should('contain', fileName + ' prêt à être synchronisé')
  cy.get('.import-file-action [type=button]')
    .click()
  cy.get('.v-snack--active')
    .should('contain', 'Le fichier ' + fileName + ' a été synchronisé.')
})

Cypress.Commands.add('addPlanning', (dates) => {
  const csvHeaders = 'Date,Heure,Inspecteur,Non,Centre,Departement'
  const horaires = [
    '07:30',
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
  ]

  const datePlaces = dates ? dates.map(date => date.toFormat('dd/MM/yy')) : []
  datePlaces.push(Cypress.env('datePlace'))
  const placesInspecteurs = datePlaces.reduce((acc, datePlace) => {
    const csvRowBuilder = (inspecteur, matricule) => horaire => `${datePlace},${horaire},${matricule},${inspecteur},${Cypress.env('centre')},75`
    const placesInspecteur1 = horaires.map(csvRowBuilder(Cypress.env('inspecteur'), Cypress.env('matricule')))
    const placesInspecteur2 = horaires.map(csvRowBuilder(Cypress.env('inspecteur2'), Cypress.env('matricule2')))
    return acc.concat(placesInspecteur1).concat(placesInspecteur2)
  }, [])
  const placesArray = [csvHeaders].concat(placesInspecteurs).join('\n')
  // Creates the csv file
  cy.writeFile(Cypress.env('filePath') + '/planning.csv', placesArray)
  // Adds the places from the created planning file
  cy.contains('calendar_today')
    .click()
  cy.get('.t-import-places [type=checkbox]')
    .check({ force: true })
  const filePath1 = '../../../' + Cypress.env('filePath') + '/planning.csv'
  const fileName1 = 'planning.csv'
  cy.fixture(filePath1).then(fileContent => {
    cy.get('[type=file]').upload({ fileContent, fileName: fileName1, mimeType: 'text/csv' })
  })
  cy.get('.v-snack--active')
    .should('contain', fileName1 + ' prêt à être synchronisé')
  cy.get('.import-file-action [type=button]')
    .click({ force: true })
  cy.get('.v-snack--active', { timeout: 10000 })
    .should('contain', 'Le fichier ' + fileName1 + ' a été traité pour le departement 75.')
})

Cypress.Commands.add('candidatePreSignUp', (candidat) => {
  // The candidate fills the pre-sign-up form
  cy.visit(Cypress.env('frontCandidat') + 'qu-est-ce-que-candilib')
  cy.contains('Se pré-inscrire')
    .click()
  cy.get('h2')
    .should('contain', 'Réservez votre place d\'examen')
  cy.contains('NEPH')
    .parent()
    .children('input')
    .type(candidat ? candidat.codeNeph : Cypress.env('NEPH'))
  cy.contains('Nom de naissance')
    .parent()
    .children('input')
    .type(candidat ? candidat.nomNaissance : Cypress.env('candidat'))
  cy.contains('Prénom')
    .parent()
    .children('input')
    .type(Cypress.env('firstName'))
  cy.contains('Courriel *')
    .parent()
    .children('input')
    .type(candidat ? candidat.email : Cypress.env('emailCandidat'))
  cy.contains('Portable')
    .parent()
    .children('input')
    .type('0716253443')

  cy.get('.t-presignup-form .t-select-departements .v-input__slot').click()
  cy.get('.v-list-item__title').contains(Cypress.env('departement')).click()

  cy.contains('Pré-inscription')
    .click()
    // Checks the access
  cy.url()
    .should('contain', 'email-validation')
  cy.get('h3')
    .should('contain', 'Validation en attente')
  cy.get('div')
    .should('contain', 'Vous allez bientôt recevoir un courriel à l\'adresse que vous nous avez indiqué.')
    // Validates the email address
  cy.getLastMail().getRecipients()
    .should('contain', candidat ? candidat.email : Cypress.env('emailCandidat'))
  cy.getLastMail().getSubject()
    .should('contain', 'Validation d\'adresse courriel pour Candilib')
  cy.getLastMail().its('Content.Body').then((mailBody) => {
    // TODO: decode properly the href
    const codedLink = mailBody.split('href=3D"')[1].split('">')[0]
    const withoutEq = codedLink.replace(/=\r\n/g, '')
    const validationLink = withoutEq.replace(/=3D/g, '=')
    cy.visit(validationLink)
  })
  cy.get('h3')
    .should('contain', 'Adresse courriel validée')
    // Gets the confirmation email
  cy.getLastMail().getRecipients()
    .should('contain', candidat ? candidat.email : Cypress.env('emailCandidat'))
  cy.getLastMail().getSubject()
    .should('contain', '=?UTF-8?Q?Inscription_Candilib_en_attente_de_v?= =?UTF-8?Q?=C3=A9rification?=')
})

Cypress.Commands.add('candidatConnection', (candidatEmail) => {
  cy.visit(Cypress.env('frontCandidat') + 'qu-est-ce-que-candilib')
  cy.contains('Déjà')
    .click()
  cy.get('input').type(candidatEmail)
  cy.get('form').find('button').click()
  cy.wait(500)
  cy.getLastMail().getRecipients()
    .should('contain', candidatEmail)
  cy.getLastMail()
    .getSubject()
    .should('contain', '=?UTF-8?Q?Validation_de_votre_inscription_=C3=A0_C?= =?UTF-8?Q?andilib?=')
})

Cypress.Commands.add('candidateValidation', () => {
  cy.writeFile(Cypress.env('filePath') + '/aurige.json',
    [
      {
        codeNeph: Cypress.env('NEPH'),
        nomNaissance: Cypress.env('candidat'),
        email: Cypress.env('emailCandidat'),
        dateReussiteETG: '2018-10-12',
        nbEchecsPratiques: '0',
        dateDernierNonReussite: '',
        objetDernierNonReussite: '',
        reussitePratique: '',
        candidatExistant: 'OK',
      },
    ])
  cy.contains('import_export')
    .click()
  cy.get('.ag-overlay')
    .should('contain', 'No Rows To Show')
  const filePath2 = '../../../' + Cypress.env('filePath') + '/aurige.json'
  const fileName2 = 'aurige.json'
  cy.fixture(filePath2).then(fileContent => {
    cy.get('.input-file-container [type=file]')
      .upload({
        fileContent: JSON.stringify(fileContent),
        fileName: fileName2,
        mimeType: 'application/json',
      })
  })
  cy.get('.v-snack--active')
    .should('contain', fileName2 + ' prêt à être synchronisé')
  cy.get('.import-file-action [type=button]')
    .click()
  cy.get('.v-snack--active')
    .should('contain', 'Le fichier ' + fileName2 + ' a été synchronisé.')
    // Checks that the candidate is validated
  cy.get('.ag-cell')
    .should('contain', Cypress.env('candidat'))
  cy.get('.ag-cell')
    .should('contain', 'Pour le 75, un magic link est envoyé à ' + Cypress.env('emailCandidat'))
  cy.getLastMail({ recipient: Cypress.env('emailCandidat') })
    .getSubject()
    .should('contain', '=?UTF-8?Q?Validation_de_votre_inscription_=C3=A0_C?= =?UTF-8?Q?andilib?=')
})

Cypress.Commands.add('addCandidatToPlace', (date, candidatName) => {
  // Goes to planning
  const placeDate = (date && date.toFormat('yyyy-MM-dd')) || Cypress.env('placeDate')
  cy.visit(Cypress.env('frontAdmin') + 'admin/gestion-planning/*/' + placeDate)
  // Add candidate to the first place
  cy.get('.v-tabs')
    .contains(Cypress.env('centre'))
    .click({ force: true })
  cy.contains('replay')
    .click()
  cy.get('.v-window-item').not('[style="display: none;"]')
    .should('have.length', 1)
    .and('contain', Cypress.env('inspecteur'))
    .contains(Cypress.env('inspecteur'))
    .parents('tbody').within(($row) => {
      cy.get('.place-button')
        .should('not.contain', 'block')
        .contains('check_circle')
        .click()
      cy.contains('Affecter un candidat')
        .click()
      cy.get('.search-input [type=text]')
        .type(candidatName || Cypress.env('candidat'))
      cy.root().parents().contains(candidatName || Cypress.env('candidat'))
        .click()
      cy.get('.place-details')
        .should('contain', Cypress.env('centre'))
      cy.contains('Valider')
        .click()
    })
})

Cypress.Commands.add('removeCandidatOnPlace', () => {
  cy.visit(Cypress.env('frontAdmin') + 'admin/gestion-planning/*/' + Cypress.env('placeDate'))
  cy.get('.v-window-item').not('[style="display: none;"]')
    .contains(Cypress.env('inspecteur2'))
    .parents('tbody').within(($row) => {
      cy.get('.place-button')
        .contains('face')
        .click()
      cy.contains('Annuler réservation')
        .click()
      cy.contains('Supprimer réservation')
        .click()
    })
})

Cypress.Commands.add('deleteCentres', (centres) => {
  cy.request(Cypress.env('ApiRestDB') + '/centres').then((content) => {
    const centresFound = content.body
    if (centresFound && centresFound.length > 0) {
      const centersName = centres.map(({ nom }) => nom)
      centresFound.filter(centre => centersName.includes(centre.nom))
        .map(({ _id }) => cy.request('DELETE', Cypress.env('ApiRestDB') + '/centres/' + _id))
    }
  })
})
