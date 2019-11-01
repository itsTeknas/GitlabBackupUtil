'use strict'

const rp = require('request-promise');
const _ = require('lodash');
const tokenJson = require('./token');
const cmd = require('node-cmd');
const Promise = require('bluebird');
const cmdAsync = Promise.promisify(cmd.get, { multiArgs: true, context: cmd });
const token = tokenJson.token;

(async () => {

  let groups = await rp.get('https://www.gitlab.com/api/v4/groups?per_page=999', {
    json: true,
    qs: {
      simple: true,
    },
    headers: {
      'PRIVATE-TOKEN': token
    }
  })
  console.log(`Got groups:\n`, groups.map(g => g.name))
  let gids = _.map(groups, 'id')
  let pgits = []
  for (let gid of gids) {
    let projects = await rp.get(`https://www.gitlab.com/api/v4/groups/${gid}/projects?per_page=999`, {
      json: true,
      qs: {
        simple: true,
      },
      headers: {
        'PRIVATE-TOKEN': token
      }
    })
    let ps = _.map(projects, 'http_url_to_repo')
    for (let p of ps) {
      console.log(`Got project ${p} of ${gid}`)
      pgits.push(p)
    }
  }

  console.log("Backing up following repos")
  console.log(pgits)

  for (let git of pgits) {
    const repoName = git.substring(19, git.length - 4)
    console.log(`Cloning ${repoName}`)
    const stdout = await cmdAsync(`git clone ${git} backup/${repoName}`)
  }
})()