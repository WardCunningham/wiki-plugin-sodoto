// register plugin, server-side component
// These handlers are launched with the wiki server.

import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import bdo from 'bdo-js'

const startServer = async function (params) {
  const { app, argv } = params

  // settings = null
  // fs.readFile path.resolve(argv.status, 'plugins', 'register', 'settings.json'), (err, text) ->
  //   return console.log('register settings', err) if err
  //   settings = JSON.parse text

  const admin = function (req, res, next) {
    if (app.securityhandler.isAdmin(req)) {
      return next()
    } else {
      let a, u
      if (!argv.admin) {
        a = 'no admin specified'
      }
      if (!req.session?.passport?.user && !req.session?.email && !req.session?.friend) {
        u = 'not logged in'
      }
      return res.status(403).send(`Must be admin user, ${a || u}`)
    }
  }

  const farm = function (req, res, next) {
    if (argv.farm) {
      return next()
    } else {
      return res.status(403).send({ error: 'Must be wiki farm to make subdomains' })
    }
  }

  const owner = function (req, res, next) {
    if (!app.securityhandler.isAuthorized(req)) {
      return res.status(401).send('must be owner')
    }
    return next()
  }

  app.get('/plugin/sodoto/view', farm, owner, async function (req, res) {
    const e500 = msg => res.status(500).send(msg)

    const payload = JSON.parse(atob(req.query.payload))
    console.log(payload.item)

    const secrets = `${argv.status}/secrets/sodoto`
    const bdokeys = await fsp.readFile(`${secrets}/keys.json`,{encoding:'utf8'})
      .then(file => JSON.parse(file))
    console.log(bdokeys)
    const {privateKey,pubKey} = bdokeys.bdo


    const hash = ``
    const newBDO = {}
    let keys
    const saveKeys = k => (keys = k)
    const getKeys = () => keys
    const uuid = await bdo.createUser(hash, newBDO, saveKeys, getKeys)
    const sodotoBDO = await bdo.getBDO(uuid, hash, '0211749ad18cc9ca022ce8bf101b4e8769461dcdc399e65d0fb78625047d36f15a')
    console.log({ sodotoBDO })
    return res.json(sodotoBDO)
  })

  // app.post('/plugin/sodoto/update', farm, owner, async function (req, res) {
  //   const payload = req.body
  //   const updatedBDO = await bdo.updateBDO(uuid, hash, payload)
  //   return res.json(updatedBDO)
  // }
}

export { startServer }
