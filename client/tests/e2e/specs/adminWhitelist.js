/* Tests :
- Add single address to the whitelist
- Add a batch of addresses to the whitelist
- Inability to add bad addresses
- Inability to add already added addresses
- Whitelist search
- Removes address from the whitelist grid
- Removes address from the whitelist search
- Inability to create account without a whitelisted address
- Ability to create account when the address is in the whitelist
*/

describe('Whitelist tests', () => {
  before(() => {
    // Delete all mails before start
    cy.deleteAllMails()
    cy.adminLogin()
    cy.archiveCandidate({ codeNeph: '98745612309', nomNaissance: 'D.Monkey', email: Cypress.env('email') })
    cy.adminDisconnection()
  })

  it('Whitelist tests', () => {
    cy.visit(Cypress.env('frontCandidat') + 'qu-est-ce-que-candilib')
    cy.contains('Se pré-inscrire')
      .click()
    cy.get('h2')
      .should('contain', 'Réservez votre place d\'examen')
    cy.contains('NEPH')
      .parent()
      .children('input')
      .type(Cypress.env('NEPH'))
    cy.contains('Nom de naissance')
      .parent()
      .children('input')
      .type(Cypress.env('candidat'))
    cy.contains('Prénom')
      .parent()
      .children('input')
      .type(Cypress.env('firstName'))
    cy.contains('Courriel *')
      .parent()
      .children('input')
      .type(Cypress.env('email'))
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
    cy.get('.v-snack--active')
      .should('contain', 'L\'adresse courriel renseignée (' + Cypress.env('email') + ') n\'est pas dans la liste des invités')
    cy.adminLogin()
    // Visits the whitelist
    cy.visit(Cypress.env('frontAdmin') + 'admin/whitelist')
    cy.get('h2')
      .should('contain', 'Liste blanche')
    // Adds the email
    cy.contains('Ajouter une adresse courriel')
      .click()
    cy.get('.t-add-one-whitelist [type=text]')
      .type(Cypress.env('email') + '{enter}')
    cy.get('.v-snack--active')
      .should('contain', Cypress.env('email') + ' ajouté à la liste blanche')
    // Tries to add bad addresses
    cy.contains('Ajouter un lot d\'adresse courriel')
      .click()
    cy.get('#whitelist-batch-textarea')
      .type('test.com\ntest@.com\n@test.com\ntest@test\ntest@test.t\n')
    cy.contains('Enregistrer ces adresses')
      .click()
    cy.get('.v-snack--active')
      .should('contain', 'Aucun email n\'a pu être ajouté à la liste blanche')
    cy.get('.t-whitelist-batch-result')
      .should('contain', 'Adresse invalide')
      .and('not.contain', 'Adresse courriel existante')
      .and('not.contain', 'Adresse enregistrée')
    // Add some addresses
    cy.contains('Ajouter un lot d\'adresse courriel')
      .click()
    cy.get('#whitelist-batch-textarea')
      .type('test@example.com\n' + Cypress.env('email'))
    cy.contains('Enregistrer ces adresses')
      .click()
    cy.get('.v-snack--active')
      .should('contain', 'Certains emails n\'ont pas pu être ajoutés à la liste blanche')
    cy.get('.t-whitelist-batch-result')
      .should('contain', 'Adresse enregistrée')
      .and('contain', 'Adresse courriel existante')
      .and('not.contain', 'Adresse invalide')
    cy.adminDisconnection()
    // Candidate is in the whitelist, the pre sign-up should work now
    cy.candidatePreSignUp({ codeNeph: '98745612309', nomNaissance: 'D.Monkey', email: Cypress.env('email') })
    cy.adminLogin()
    // Visits the whitelist
    cy.visit(Cypress.env('frontAdmin') + 'admin/whitelist')
    cy.get('h2')
      .should('contain', 'Liste blanche')
    // Searches for the email
    cy.get('.search-input [type=text]')
      .type(Cypress.env('email'))
    cy.get('h4')
      .should('contain', 'Adresses correspondant à la recherche (max 5)')
    // Deletes the email
    cy.get('.t-whitelist-search')
      .contains(Cypress.env('email'))
      .parents('.t-whitelist-search')
      .contains('delete')
      .click()
    cy.get('.v-dialog')
      .should('contain', 'Voulez-vous vraiment supprimer l\'adresse ' + Cypress.env('email') + ' de la whitelist ?')
    cy.contains('Oui, supprimer')
      .click()
    cy.get('.v-snack--active')
      .should('contain', Cypress.env('email') + ' supprimé de la liste blanche')
      .contains('close')
      .click()
    // Deletes test@example.com
    cy.get('.whitelist-grid')
      .contains('test@example.com')
      .parents('[role="listitem"]')
      .should('contain', 'test@example.com')
      .contains('delete')
      .click()
    cy.get('.v-dialog')
      .should('contain', 'Voulez-vous vraiment supprimer l\'adresse test@example.com de la whitelist ?')
    cy.contains('Oui, supprimer')
      .click()
    cy.get('.v-snack--active')
      .should('contain', 'test@example.com supprimé de la liste blanche')
  })
})
