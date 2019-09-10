// https://docs.cypress.io/api/introduction/api.html

// Used constants
const inspecteur = 'DUPONT03DU75'
const candidat = 'ZANETTI'
const centre = 'Noisy le Grand'
const email = 'jean@dupont.fr'
const adminLogin = 'admin@example.com'
const adminPass = 'Admin*78'
const placeDate = '2019-10-08'
const candilibAddress = 'http://localhost:8080/candilib/'
const aurigeFilePath = '../../../../server/dev-setup/aurige.new.json'
const planningFilePath = '../../../../server/dev-setup/planning-75.csv'

describe('Candidate tests', () => {
  it('Visits the candidate already signed up form', () => {
    cy.visit(candilibAddress + 'qu-est-ce-que-candilib')
    cy.get('.t-already-signed-up-button-top')
      .should('contain', 'Déjà Inscrit ?')
      .click()
    cy.get('.t-magic-link-input-top [type=text]')
      .type(email)
    cy.get('.t-magic-link-button-top')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Utilisateur non reconnu')
  })

  it('Tries to pre-signup with a not whitelisted address', () => {
    cy.visit(candilibAddress + 'qu-est-ce-que-candilib')
    cy.contains('Se pré-inscrire')
      .click()
    cy.get('h2')
      .should('contain', 'Réservez votre place d\'examen')
    cy.contains('NEPH')
      .parent()
      .children('input')
      .type('0123456789')
    cy.contains('Nom de naissance')
      .parent()
      .children('input')
      .type(candidat)
    cy.contains('Prénom')
      .parent()
      .children('input')
      .type('Jean')
    cy.contains('Courriel *')
      .parent()
      .children('input')
      .type('badtest@example.com')
    cy.contains('Portable')
      .parent()
      .children('input')
      .type('0716253443')
    cy.contains('Adresse')
      .parent()
      .children('input')
      .type('avenue')
    cy.get('.v-select-list')
      .contains('avenue')
      .click()
    cy.contains('Pré-inscription')
      .click()
    cy.get('.v-snack')
      .should('contain', 'L\'adresse courriel renseignée (badtest@example.com) n\'est pas dans la liste des invités.')
    // Goes to the 'Mentions Légales' page
    cy.contains('Mentions légales')
      .click()
    cy.url()
      .should('contain', 'mentions-legales')
    cy.get('h2')
      .should('contain', 'Mentions légales')
    cy.contains('exit_to_app')
      .click()
    cy.get('h2')
      .should('contain', 'Réservez votre place d\'examen')
    // Tests the display of the F.A.Q.
    cy.contains('Une question')
      .click()
    cy.url()
      .should('contain', 'faq')
    cy.get('h2')
      .should('contain', 'F.A.Q')
    cy.get('.question-content')
      .should('not.be.visible')
    cy.get('.question').contains('?')
      .click()
    cy.get('.question-content')
      .should('be.visible')
  })
})

describe('Admin tests', () => {
  it('Fails to login with invalid password', () => {
    cy.visit(candilibAddress + 'admin-login')
    cy.get('[type=text]')
      .type(adminLogin)
    cy.get('[type=password]')
      .type(adminPass + 'bad')
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Identifiants invalides')
  })

  it('Fails to login with invalid email', () => {
    cy.visit(candilibAddress + 'admin-login')
    cy.get('[type=text]')
      .type('admin@example')
    cy.get('[type=password]')
      .type('password')
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Veuillez remplir le formulaire')
  })

  it('Tests Aurige import/export', () => {
    cy.visit(candilibAddress + 'admin-login')
    cy.get('[type=text]')
      .type(adminLogin)
    cy.get('[type=password]')
      .type(adminPass)
    cy.get('.submit-btn')
      .click()
    // Goes to the page
    cy.contains('import_export')
      .click()
    // Verifies that there is nothing
    cy.get('.ag-overlay')
      .should('contain', 'No Rows To Show')
    // Uploads the JSON file
    const fileName = 'aurige.json'
    cy.fixture(aurigeFilePath).then(fileContent => {
      cy.get('.input-file-container [type=file]')
        .upload({
          fileContent: JSON.stringify(fileContent),
          fileName,
          mimeType: 'application/json',
        })
    })
    cy.get('.v-snack')
      .should('contain', 'aurige.json prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Le fichier aurige.json a été synchronisé.')
    // Verifies that the candidate is present
    cy.get('.ag-cell')
      .should('contain', 'candidat')
  })

  it('Tests the import of csv files in the planning', () => {
    cy.visit(candilibAddress + 'admin-login')
    cy.get('[type=text]')
      .type(adminLogin)
    cy.get('[type=password]')
      .type(adminPass)
    cy.get('.submit-btn')
      .click()
    // Goes to where the places are
    cy.visit(candilibAddress + 'admin/gestion-planning/0/' + placeDate)
    cy.get('.v-tabs')
      .contains(centre)
      .click({ force: true })
    cy.get('.hexagon-wrapper').contains('93')
      .click()
    cy.get('.hexagon-wrapper').contains('75')
      .click()
    // Removes the inspector's places
    cy.get('.v-window-item[style=""]')
      .contains(inspecteur)
      .parents('tbody').within(($row) => {
        cy.contains('delete')
          .click()
        cy.contains('Supprimer la journée')
          .click()
        cy.contains('Valider')
          .click()
      })
    // The inspector should not be present anymore
    cy.get('.name-ipcsr-wrap')
      .should('not.contain', inspecteur)
    // Imports the places
    cy.get('.t-import-places [type=checkbox]')
      .check({ force: true })
    const fileName = 'planning.csv'
    cy.fixture(planningFilePath).then(fileContent => {
      cy.get('[type=file]').upload({ fileContent, fileName, mimeType: 'text/csv' })
    })
    cy.get('.v-snack')
      .should('contain', 'planning.csv prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click({ force: true })
    cy.get('.v-snack', { timeout: 10000 })
      .should('contain', 'Le fichier planning.csv a été traité pour le departement 75.')
    // The inspector should be back
    cy.contains('replay')
      .click()
    cy.get('.name-ipcsr-wrap')
      .should('contain', inspecteur)
  })

  it('Searches for candidate and disconnects', () => {
    cy.visit(candilibAddress + 'admin-login')
    cy.get('[type=text]')
      .type(adminLogin)
    cy.get('[type=password]')
      .type(adminPass)
    cy.get('.submit-btn')
      .click()
    cy.get('h2')
      .should('contain', 'Tableau de bord')
    cy.get('h3')
      .should('contain', adminLogin.split('@')[0])
    // Searches for candidate
    cy.get('.t-search-candidat [type=text]')
      .type(candidat)
    cy.contains(candidat)
      .click()
    cy.get('h3')
      .should('contain', 'Informations candidats')
    cy.get('.t-result-candidat')
      .contains('Nom')
      .parent()
      .should('contain', candidat)
    // Searches for inspector
    cy.get('.t-search-inspecteur [type=text]')
      .type(inspecteur)
    cy.contains(inspecteur)
      .click()
    cy.get('h3')
      .should('contain', 'informations inspecteur')
    cy.get('.t-result-inspecteur')
      .contains('Nom')
      .parent()
      .should('contain', inspecteur)
    // Verifies the number of centers in 75 and 93
    cy.get('.layout.row.wrap').children()
      .its('length')
      .should('eq', 3)
    cy.get('.hexagon-wrapper').contains('93')
      .click()
    cy.get('.layout.row.wrap').children()
      .its('length')
      .should('eq', 4)
    // Disconnects from the app
    cy.contains('exit_to_app')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes déconnecté·e')
    cy.url()
      .should('eq', candilibAddress + 'admin-login')
  })

  it('Adds and removes places', () => {
    cy.visit(candilibAddress + 'admin-login')
    cy.get('[type=text]')
      .type(adminLogin)
    cy.get('[type=password]')
      .type(adminPass)
    cy.get('.submit-btn')
      .click()
    // Goes to planning
    cy.contains('calendar_today').click()
    // Checks the center in the 93
    cy.get('.hexagon-wrapper').contains('93')
      .click()
    cy.get('.v-tabs__div')
      .contains('Bobigny')
    // Checks if the url matches the date displayed
    cy.get('.t-btn-next-week')
      .click()
    cy.url()
      .then(($url) => {
        let url = $url.split('/')
        let date = url[url.length - 1]
        let ymd = date.split('-')
        cy.get('.t-date-picker [type=text]').invoke('val')
          .should('contain', ymd[2] + '/' + ymd[1] + '/' + ymd[0])
      })
    // Goes to another date and checks the url
    cy.visit(candilibAddress + 'admin/gestion-planning/0/' + placeDate)
    cy.get('.hexagon-wrapper').contains('75')
      .click()
    cy.url()
      .then(($url) => {
        let url = $url.split('/')
        let date = url[url.length - 1]
        let ymd = date.split('-')
        cy.get('.t-date-picker [type=text]').invoke('val')
          .should('contain', ymd[2] + '/' + ymd[1] + '/' + ymd[0])
      })
    // Deletes the first place
    cy.get('.v-tabs')
      .contains(centre)
      .click({ force: true })
    cy.wait(1000)
    cy.get('.v-window-item[style=""]')
      .contains(inspecteur)
      .parents('tbody').within(($row) => {
        cy.get('.place-button')
          .contains('check_circle')
          .click()
        cy.contains('Rendre indisponible')
          .click()
      })
    cy.get('.v-snack')
      .should('contain', 'a bien été supprimée de la base')
    // Add the first place
    cy.get('.v-window-item[style=""]')
      .contains(inspecteur)
      .parents('tbody').within(($row) => {
        cy.get('.place-button')
          .contains('block')
          .click()
        cy.contains('Rendre le créneau disponible')
          .click()
      })
    cy.get('.v-snack')
      .should('contain', 'a bien été crée')
    // Add candidate to the first place
    cy.get('.v-window-item[style=""]')
      .contains(inspecteur)
      .parents('tbody').within(($row) => {
        cy.get('.place-button')
          .contains('check_circle')
          .click()
        cy.contains('Affecter un candidat')
          .click()
        cy.get('.search-input [type=text]')
          .type(candidat)
        cy.root().parents().contains(candidat)
          .click()
        cy.get('.place-details')
          .should('contain', centre)
        cy.contains('Valider')
          .click()
      })
    cy.get('.v-snack')
      .should('contain', candidat)
      .and('contain', 'a bien été affecté à la place')
    // Removes the candidate from the place
    cy.get('.v-window-item[style=""]')
      .contains(inspecteur)
      .parents('tbody').within(($row) => {
        cy.get('.place-button')
          .contains('face')
          .click()
        cy.contains('Annuler réservation')
          .click()
        cy.contains('Supprimer réservation')
          .click()
      })
    cy.get('.v-snack')
      .should('contain', 'La réservation choisie a été annulée. Un courriel n\'a pas pu être envoyé au candidat.')
    // Add the place back for retry-ability
    cy.get('.v-window-item[style=""]')
      .contains(inspecteur)
      .parents('tbody').within(($row) => {
        cy.get('.place-button')
          .contains('block')
          .click()
        cy.contains('Rendre le créneau disponible')
          .click()
      })
    cy.get('.v-snack')
      .should('contain', 'a bien été crée.')
  })

  it('Adds and removes from the whitelist', () => {
    cy.visit(candilibAddress + 'admin-login')
    cy.get('[type=text]')
      .type(adminLogin)
    cy.get('[type=password]')
      .type(adminPass)
    cy.get('.submit-btn')
      .click()
    // Visits the whitelist
    cy.visit(candilibAddress + 'admin/whitelist')
    cy.get('h2')
      .should('contain', 'Liste blanche')
    // Adds the email
    cy.contains('Ajouter une adresse courriel')
      .click()
    cy.get('.t-add-one-whitelist [type=text]')
      .type(email + '{enter}')
    cy.get('.v-snack')
      .should('contain', email + ' ajouté à la liste blanche')
    // Tries to add bad addresses
    cy.contains('Ajouter un lot d\'adresse courriel')
      .click()
    cy.get('#whitelist-batch-textarea')
      .type('test.com\ntest@.com\n@test.com\ntest@test\ntest@test.t\n')
    cy.contains('Enregistrer ces adresses')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Aucun email n\'a pu être ajouté à la liste blanche')
    cy.get('.t-whitelist-batch-result')
      .should('contain', 'Adresse invalide')
      .and('not.contain', 'Adresse courriel existante')
      .and('not.contain', 'Adresse enregistrée')
    // Add some addresses
    cy.contains('Ajouter un lot d\'adresse courriel')
      .click()
    cy.get('#whitelist-batch-textarea')
      .type('test@example.com\n' + email)
    cy.contains('Enregistrer ces adresses')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Certains emails n\'ont pas pu être ajoutés à la liste blanche')
    cy.get('.t-whitelist-batch-result')
      .should('contain', 'Adresse enregistrée')
      .and('contain', 'Adresse courriel existante')
      .and('not.contain', 'Adresse invalide')
    // Searches for the email
    cy.get('.search-input [type=text]')
      .type(email)
    cy.get('.v-select-list').contains(email)
      .click()
    cy.get('h4')
      .should('contain', 'Adresses correspondant à la recherche (max 5)')
    // Test for dblclick (not functionning)
    /* cy.get('.t-whitelist-search')
      .contains(email)
      .dblclick()
    cy.get('.v-snack')
      .should('contain', 'L\'email '+email+' a été copié dans le presse-papier') */
    // Deletes the email
    cy.get('.t-whitelist-search')
      .contains(email)
      .parents('.t-whitelist-search')
      .contains('delete')
      .click()
    cy.get('.v-dialog')
      .should('contain', 'Voulez-vous vraiment supprimer l\'adresse ' + email + ' de la whitelist ?')
    cy.contains('Oui, supprimer')
      .click()
    cy.get('.v-snack')
      .should('contain', email + ' supprimé de la liste blanche')
    // Deletes test@example.com
    cy.get('.whitelist-grid')
      .contains('test@example.com')
      .parents('[role="listitem"]')
      .contains('delete')
      .click()
    cy.get('.v-dialog')
      .should('contain', 'Voulez-vous vraiment supprimer l\'adresse test@example.com de la whitelist ?')
    cy.contains('Oui, supprimer')
      .click()
    cy.get('.v-snack')
      .should('contain', 'test@example.com supprimé de la liste blanche')
  })
})
