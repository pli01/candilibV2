// https://docs.cypress.io/api/introduction/api.html

xdescribe('Candidat tests', () => {
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
  xit('Logins with invalid password', () => {
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

  xit('Logins with invalid email', () => {
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

  xit('Logins and search for candidate', () => {
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
      .type('Jessie')
    cy.contains('JESSIE')
      .click()
    cy.get('h3')
      .should('contain', 'Informations candidats')
    cy.get('.t-search-inspecteur [type=text]')
      .type('duponddu75')
    cy.contains('DUPONDDU75')
      .click()
    cy.get('h3')
      .should('contain', 'informations inspecteur')
  })

  xit('Logins and add or remove places', () => {
    cy.visit('http://localhost:8080/candilib/admin-login')
    cy.get('[type=text]')
      .type('admin@example.com')
    cy.get('[type=password]')
      .type('Admin*78')
    cy.get('.submit-btn')
      .click()
    cy.contains('calendar_today').click()
    cy.url()
      .then(($url) => {
        let url = $url.split('/')
        let date = url[url.length - 1]
        let ymd = date.split('-')
        cy.get('.t-date-picker [type=text]').invoke('val')
          .should('contain', ymd[2].concat('/', ymd[1], '/', ymd[0]))
      })
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
  })

  xit('Logins and add to the whitelist', () => {
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

  xit('Tests the import of csv files in the planning', () => {
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
    cy.get('.t-import-places [type="checkbox"]')
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
})
