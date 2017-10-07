'use strict';

let rp = require('request-promise');
let _ = require('lodash');
let tokenJson = require('./token')

const token = tokenJson.token;

let Promise = require('bluebird')
let cmd = require('node-cmd')

rp.get('https://www.gitlab.com/api/v4/groups', {
  json: true,
  qs: {
    simple: true,
  },
  headers: {
    'PRIVATE-TOKEN': token
  }
}).then(groups => {
  let gids = _.map(groups, 'id')
  let pgits = [];
  let promises = [];
  for (let gid of gids) {
    promises.push(
      rp.get(`https://www.gitlab.com/api/v4/groups/${gid}/projects`, {
        json: true,
        qs: {
          simple: true,
        },
        headers: {
          'PRIVATE-TOKEN': token
        }
      }).then(projects => {
        let ps = _.map(projects, 'http_url_to_repo')
        for (let p of ps) {
          pgits.push(p);
        }
      })
    )
  }
  Promise.all(promises).then(() => {
    console.log(pgits);
    for (let git of pgits) {
      cmd.run(`git clone ${git} backup/${git.substring(19,git.length-4)}`);
    }
  });
})