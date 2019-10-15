'use strict'

const rp = require('request-promise')
const _ = require('lodash')
const tokenJson = require('./token')
const fs = require('fs')

const token = tokenJson.token

const Promise = require('bluebird')
const cmd = require('node-cmd')

const HTTP = 'http'
const SSH = 'ssh'

const config = {
  [HTTP]: {
    directoryLenght: 19,
    projectMapping: 'http_url_to_repo'
  },
  [SSH]: {
    directoryLenght: 15,
    projectMapping: 'ssh_url_to_repo'
  },
}[SSH]

const getBackupDirectory = git => `backup/${git.substring(config.directoryLenght,git.length-4)}`

const app = async () => {
  const groups = await rp.get('https://www.gitlab.com/api/v4/groups\?per_page\=999', {
    json: true,
    qs: {
      simple: true,
    },
    headers: {
      'PRIVATE-TOKEN': token
    }
  })
  
  const gids = _.map(groups, 'id')
  const promises = gids.map(async gid => {
    const projects = await rp.get(`https://www.gitlab.com/api/v4/groups/${gid}/projects\?per_page\=999`, {
      json: true,
      qs: {
        simple: true,
      },
      headers: {
        'PRIVATE-TOKEN': token
      }
    })

    return _.map(projects, config.projectMapping)
  })

  const result = await Promise.all(promises)

  const pgits = result.reduce((prev, next) => {
    next.forEach(p => {
      prev.push(p)
    })
    return prev
  }, [])

  console.log(pgits)
  const pgitsFiltered = pgits.filter(git => !fs.existsSync(getBackupDirectory(git)))

  pgitsFiltered.forEach(git => {
    console.log(git)
    cmd.run(`git clone ${git} ${getBackupDirectory(git)}`)
  })
}

app()
