/**
 * Module de configuration principale du serveur express
 * @module app
 */
import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import fileupload from 'express-fileupload'

import { loggerStream, jsonFormat } from './util/logger'
import routes from './routes'

import npmVersion from '../package.json'

const IP_QUALIF_CANDIDAT = process.env.IP_QUALIF_CANDIDAT
const IP_QUALIF_REPARTITEUR = process.env.IP_QUALIF_REPARTITEUR

/**
 * @swagger
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     InfoObject:
 *       type: object
 *       required:
 *         - success
 *         - message
 *       properties:
 *         success:
 *           type: boolean
 *           description: Booléen à `true` si l'action a été effectuée en entier et correctement, à `false` sinon.
 *         message:
 *           type: string
 *           description: Un message compréhensible par l'usager
 *
 *     GeolocObject:
 *       type: object
 *       required:
 *         - coordinates
 *         - type
 *       properties:
 *         coordinates:
 *           type: Array
 *           example: [ 2.552847, 48.962099 ]
 *         type:
 *           type: string
 *           example: "Point"
 *
 *     CenterObject:
 *       type: object
 *       required:
 *         - geoloc
 *         - _id
 *         - nom
 *         - label
 *         - adresse
 *         - departement
 *       properties:
 *         geoloc:
 *           $ref: '#/components/schemas/GeolocObject'
 *         _id:
 *           type: string
 *           description: identifiant du centre
 *         nom:
 *           type: string
 *           description: Nom du centre (de la ville du centre)
 *         label:
 *           type: string
 *           description: Information complémentaire pour retrouver le point de rencontre du centre
 *         departement:
 *           type: string
 *           description: Département du centre
 *
 *     CandidatInfo:
 *       type: object
 *       properties:
 *         candidat:
 *           type: object
 *           description: Informations sur le candidat
 *           properties:
 *             "adresse":
 *               type: string
 *               description: Adresse postale du candidat où lui seront envoyés les correspondances de l'adiminstation
 *             "codeNeph":
 *               type: string
 *               description: NEPH du candidat
 *             "email":
 *               type: string
 *               description: Adresse courriel du candidat
 *             "nomNaissance":
 *               type: string
 *               description: Nom de naissance du candidat
 *             "portable":
 *               type: string
 *               description: Numéro de mobile du candidat
 *             "prenom":
 *               type: string
 *               description: Prénom du candidat
 *             "departement":
 *               type: string
 *               description: Département du candidat
 *       example:
 *         "candidat":
 *           "adresse": "40 Avenue des terroirs de France 93000 Villepinte"
 *           "codeNeph": "093496239512"
 *           "email": "mayswaisey@candilib.com"
 *           "nomNaissance": "SWAISEY"
 *           "portable": "0603765291"
 *           "prenom": "MAY"
 *           "departement": "93"

 *     CentresInfo:
 *       type: object
 *       properties:
 *         candidat:
 *           type: string
 *
 *   responses:
 *     InvalidTokenResponse:
 *       description: Réponse du serveur en cas de JWT absent ou invalide
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/InfoObject'
 *               - example:
 *                   success: false
 *                   message: Vous n'êtes pas connecté, veuillez vous reconnecter

 *     UnknownErrorResponse:
 *       description: Erreur inattendue
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/InfoObject'
 *               - example:
 *                   success: false
 *                   message: Oups, un problème est survenu. L'administrateur a été prévenu.

 *
 */

/**
 * Préfixe de la version majeure de l'API
 */
export const apiPrefix = '/api/v2'

const isDevelopment = [undefined, 'development'].includes(process.env.NODE_ENV)

const app = express()

/**
 * Use swagger-ui-express in development only
 */
if (isDevelopment) {
  const swaggerJsdoc = require('swagger-jsdoc')

  const options = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Candilib API',
        description: 'API Restful de Candilib',
        version: '2.0.4',
      },
      servers: [
        { url: 'http://localhost:8000/api/v2/', description: 'api-dev' },
        {
          url: 'http://localhost:8080/candilib/api/v2/',
          description: 'front-dev',
        },
        {
          url: `http://${IP_QUALIF_CANDIDAT}/candilib/api/v2/`,
          description: 'preprod candidat',
        },
        {
          url: `http://${IP_QUALIF_REPARTITEUR}/candilib-repartiteur/api/v2/`,
          description: 'preprod repartiteur',
        },
      ],
    },
    apis: ['./src/app.js', './src/routes/**/*.js'], // <-- We add this property:
  }

  const specs = swaggerJsdoc(options)

  const swaggerUi = require('swagger-ui-express')
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
}

/**
 * @swagger
 *
 * /version:
 *   get:
 *     summary: Version exacte de l'API déployée (Disponible uniquement depuis l'URL répartiteur)
 *     description: Retourne la version exacte de l'API déployée
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Numéro de version détaillée de l'API déployée
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *             example:
 *               2.0.0-alpha.0
 *
 */
app.get(`${apiPrefix}/version`, function getVersion (req, res) {
  res.send(npmVersion.version)
})

/**
 * Utiliser morgan pour journaliser toutes les requêtes en format JSON
 */
app.use(morgan(jsonFormat, { stream: loggerStream }))

/**
 * Analyser le corps des requêtes, des formulaires multipart et les fichiers téléversés
 */
app.use(bodyParser.json({ limit: '20mb' }))
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
app.use(fileupload({ limits: { fileSize: 50 * 1024 * 1024 } }))

/**
 * Traiter toutes les requêtes dont le chemin commençe par le préfix défini correspondant à la version majeure de l'API
 */
app.use(apiPrefix, routes)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ressource introuvable',
  })
})

export default app
