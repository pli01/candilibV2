// https://docs.cypress.io/api/introduction/api.html

describe('Candidat tests', () => {
  it('Visits the candidat already signed up form', () => {
    cy.visit('http://localhost:8080/candilib/qu-est-ce-que-candilib')
    cy.get('.t-already-signed-up-button-top')
      .should('contain', 'Déjà Inscrit ?')
      .click()
    cy.get('.t-magic-link-input-top [type=text]')
      .type('jean@dupont.fr')
    cy.get('.t-magic-link-button-top')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Utilisateur non reconnu')
  })

  it('Visits the candidat subscribe form', () => {
    cy.visit('http://localhost:8080/candilib/qu-est-ce-que-candilib')
    cy.contains('Se pré-inscrire')
      .click()
    cy.get('h2')
      .should('contain', 'Réservez votre place d\'examen')
  })
})

describe('Admin tests', () => {
  it('Fails to login with invalid password', () => {
    cy.visit('http://localhost:8080/candilib/admin-login')
    cy.get('[type=text]')
      .type('admin@example.com')
    cy.get('[type=password]')
      .type('password')
    cy.get('.submit-btn')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Identifiants invalides')
  })

  it('Fails to login with invalid email', () => {
    cy.visit('http://localhost:8080/candilib/admin-login')
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
    cy.visit('http://localhost:8080/candilib/admin-login')
    cy.get('[type=text]')
      .type('admin@example.com')
    cy.get('[type=password]')
      .type('Admin*78')
    cy.get('.submit-btn')
      .click()
    cy.contains('import_export')
      .click()
    cy.get('.ag-overlay')
      .should('contain', 'No Rows To Show')
    // can't verify file download
    // cy.get('.aurige-action--export [type=button]').click()
    const filePath = '../../../../server/dev-setup/aurige.new.json'
    const fileName = 'aurige.new.json'
    cy.fixture(filePath).then(fileContent => {
      cy.get('.input-file-container [type=file]')
        .upload({
          fileContent: JSON.stringify(fileContent),
          fileName,
          mimeType: 'application/json',
        })
    })
    cy.get('.v-snack')
      .should('contain', 'aurige.new.json prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Le fichier aurige.new.json a été synchronisé.')
    cy.get('.ag-cell')
      .should('contain', 'MCAFFEE')
  })

  it('Tests the import of csv files in the planning', () => {
    cy.visit('http://localhost:8080/candilib/admin-login')
    cy.get('[type=text]')
      .type('admin@example.com')
    cy.get('[type=password]')
      .type('Admin*78')
    cy.get('.submit-btn')
      .click()
    cy.visit('http://localhost:8080/candilib/admin/gestion-planning/5d6fc64524fc972a96223421/2019-10-07')
    cy.get('.name-ipcsr-wrap')
      .should('contain', 'DUPONTDU75')
    cy.contains('delete')
      .click()
    cy.contains('Supprimer la journée')
      .click()
    cy.contains('Valider')
      .click()
    cy.get('.name-ipcsr-wrap')
      .should('not.contain', 'DUPONTDU75')
    cy.get('.t-import-places [type=checkbox]')
      .check({ force: true })
    const fileName = '../../../../server/dev-setup/planning-75.csv'
    cy.fixture(fileName).then(fileContent => {
      cy.get('[type=file]').upload({ fileContent, fileName, mimeType: 'text/csv' })
    })
    cy.get('.v-snack')
      .should('contain', 'planning-75.csv prêt à être synchronisé')
    cy.get('.import-file-action [type=button]')
      .click({ force: true })
    cy.get('.v-snack', { timeout: 10000 })
      .should('contain', 'Le fichier planning-75.csv a été traité pour le departement 75.')
    cy.visit('http://localhost:8080/candilib/admin/gestion-planning/5d6fc64524fc972a96223421/2019-10-07')
    cy.get('.name-ipcsr-wrap')
      .should('contain', 'DUPONTDU75')
  })

  it('Searchs for candidate and disconnects', () => {
    cy.visit('http://localhost:8080/candilib/admin-login')
    cy.get('[type=text]')
      .type('admin@example.com')
    cy.get('[type=password]')
      .type('Admin*78')
    cy.get('.submit-btn')
      .click()
    cy.get('h2')
      .should('contain', 'Tableau de bord')
    cy.get('.t-search-candidat [type=text]')
      .type('Mcaf')
    cy.contains('MCAFFEE')
      .click()
    cy.get('h3')
      .should('contain', 'Informations candidats')
    cy.get('.t-search-inspecteur [type=text]')
      .type('duponddu75')
    cy.contains('DUPONDDU75')
      .click()
    cy.get('h3')
      .should('contain', 'informations inspecteur')
    cy.get('.layout.row.wrap').children()
      .its('length')
      .should('eq', 3)
    cy.get('.hexagon-wrapper').contains('93')
      .click()
    cy.get('.layout.row.wrap').children()
      .its('length')
      .should('eq', 4)
    cy.contains('exit_to_app')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Vous êtes déconnecté·e')
    cy.url()
      .should('eq', 'http://localhost:8080/candilib/admin-login')
  })

  it('Adds and removes places', () => {
    cy.visit('http://localhost:8080/candilib/admin-login')
    cy.get('[type=text]')
      .type('admin@example.com')
    cy.get('[type=password]')
      .type('Admin*78')
    cy.get('.submit-btn')
      .click()
    cy.contains('calendar_today').click()
    cy.get('.hexagon-wrapper').contains('93')
      .click()
    cy.get('.v-tabs__div')
      .contains('Bobigny')
    cy.get('.t-btn-next-week')
      .click()
    cy.url()
      .then(($url) => {
        let url = $url.split('/')
        let date = url[url.length - 1]
        let ymd = date.split('-')
        cy.get('.t-date-picker [type=text]').invoke('val')
          .should('contain', ymd[2].concat('/', ymd[1], '/', ymd[0]))
      })
    cy.visit('http://localhost:8080/candilib/admin/gestion-planning/5d6fc64524fc972a96223421/2019-10-07')
    cy.get('.hexagon-wrapper').contains('75')
      .click()
    cy.url()
      .then(($url) => {
        let url = $url.split('/')
        let date = url[url.length - 1]
        let ymd = date.split('-')
        cy.get('.t-date-picker [type=text]').invoke('val')
          .should('contain', ymd[2].concat('/', ymd[1], '/', ymd[0]))
      })
    cy.get('.t-select-place')
      .contains('check_circle')
      .click()
    cy.contains('Rendre indisponible')
      .click()
    cy.get('.v-snack')
      .should('contain', '2019 8:00] a bien été supprimée de la base')
    cy.get('.t-select-place')
      .contains('block')
      .click()
    cy.contains('Rendre le créneau disponible')
      .click()
    cy.get('.v-snack')
      .should('contain', '2019 08:00] a bien été crée.')
    cy.get('.t-select-place')
      .contains('check_circle')
      .click()
    cy.contains('Affecter un candidat')
      .click()
    cy.get('.search-input [type=text]')
      .type('mcaff')
    cy.contains('MCAFFEE')
      .click()
    cy.contains('Valider')
      .click()
    cy.get('.v-snack')
      .should('contain', 'Le candidat Nom: [MCAFFEE] Neph: [093631754283] a bien été affecté à la place du Mon 07 M10 2019 à 8:00')
    cy.get('.t-select-place')
      .contains('face')
      .click()
    cy.contains('Annuler réservation')
      .click()
    cy.contains('Supprimer réservation')
      .click()
    cy.get('.v-snack')
      .should('contain', 'La réservation choisie a été annulée. Un courriel n\'a pas pu être envoyé au candidat.')
    cy.get('.t-select-place')
      .contains('block')
      .click()
    cy.contains('Rendre le créneau disponible')
      .click()
    cy.get('.v-snack')
      .should('contain', '2019 08:00] a bien été crée.')
  })

  it('Adds and removes from the whitelist', () => {
    cy.visit('http://localhost:8080/candilib/admin-login')
    cy.get('[type=text]')
      .type('admin@example.com')
    cy.get('[type=password]')
      .type('Admin*78')
    cy.get('.submit-btn')
      .click()
    cy.visit('http://localhost:8080/candilib/admin/whitelist')
    cy.get('h2')
      .should('contain', 'Liste blanche')
    cy.contains('Ajouter une adresse courriel')
      .click()
    cy.get('.t-add-one-whitelist [type=text]')
      .type('jean@dupont.fr{enter}')
    cy.get('.v-snack')
      .should('contain', 'jean@dupont.fr ajouté à la liste blanche')
    cy.get('.t-add-one-whitelist [type=text]')
      .blur()
    cy.get('.search-input [type=text]')
      .type('jean@')
    cy.get('.v-select-list').contains('jean@dupont.fr')
      .click()
    cy.get('h4')
      .should('contain', 'Adresses correspondant à la recherche (max 5)')
    cy.contains('delete')
      .click()
    cy.contains('Oui, supprimer')
      .click()
    cy.get('.v-snack')
      .should('contain', 'jean@dupont.fr supprimé de la liste blanche')
  })
})
