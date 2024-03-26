#!/usr/bin/env node

'use strict'

const fs = require('fs')
const rp = require('request-promise')
const _ = require('lodash')
const Promise = require('bluebird')
const cmd = require('node-cmd')
const cmdAsync = Promise.promisify(cmd.get, {
  multiArgs: true,
  context: cmd
})
const cliProgress = require('cli-progress');

(async () => {
  let argv = require('yargs')
    .usage('Utility to backup all gitlab repos to a local directory')
    .option('token', {
      alias: 't',
      type: 'string',
      description: 'Gitlab Token'
    })
    .option('output', {
      alias: 'o',
      type: 'string',
      description: 'Backup to output directory, defaults to ./gitlab-backup'
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Enable verbose output'
    })
    .option('url', {
      alias: 'u',
      type: 'string',
      description: 'Specify Gitlab instance URL'
    })
    .option('method', {
      alias: 'm',
      type: 'string',
      description: 'Specify clone method (default is http)'
    })
    .help(true)
    .argv

  const baseUrl = argv.url || 'https://gitlab.com'
  if(argv.verbose){
    console.log(`Set gitlab base url to ${baseUrl}`)
  }
  console.log()
  if (!argv.token) {
    console.log(
      `Please pass your gitlab token using the --token flag,\nGet your token at ${baseUrl}/profile/personal_access_tokens\n\npass --help for full help\n\n`
    )
    process.exit(1)
  }
  
  const method = argv.method == 'ssh' ? 'ssh_url_to_repo' : 'http_url_to_repo'
  const requestOptions = {
    json: true,
    qs: {
      simple: true
    },
    headers: {
      'PRIVATE-TOKEN': argv.token
    }
  }

  const user = await rp.get(`${baseUrl}/api/v4/user`, requestOptions)
  if (argv.verbose) {
    console.log(`Got user: ${user.name} (${user.username}) ID: ${user.id}`)
  }

  const personalProjects = await rp.get(
    `${baseUrl}/api/v4/users/${user.id}/projects?per_page=100`,
    requestOptions
  )
  if (argv.verbose) {
    console.log(
      'Got personal projects:\n',
      // personalProjects
      personalProjects.map(p => p.name)
    )
  }

  let pgits = _.map(personalProjects, method)

  const groups = await rp.get(
    `${baseUrl}/api/v4/groups?per_page=100`,
    requestOptions
  )

  if (argv.verbose) {
    console.log(
      'Got groups:\n',
      groups.map(g => g.name)
    )
  }

  const gids = _.map(groups, 'id')
  for (let gid of gids) {
    let projects = await rp.get(
      `${baseUrl}/api/v4/groups/${gid}/projects?per_page=100`,
      requestOptions
    )
    let ps = _.map(projects, method)
    for (let p of ps) {
      console.log(`Got project ${p} of ${gid}`)
      pgits.push(p)
    }
  }

  if (argv.verbose) {
    console.log('Backing up following repos')
    console.log(pgits)
  }

  const cloneProgressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.legacy
  )
  cloneProgressBar.start(pgits.length, 0)

  let index = 0
  for (let repo of pgits) {
    const repoName = repo.substring(argv.method == 'ssh' ? 15 : 19, repo.length - 4)
    const repoPath = `${argv.output || 'gitlab-backup'}/${repoName}`

    if (fs.existsSync(repoPath)) {
      const stats = fs.statSync(repoPath)

      if (!stats.isDirectory) {
        console.error(`Path ${repoPath} exist and not a directory. Skipped.`)
      } else {
        console.log(`Pulling ${repoName}`)
        const stdout = await cmdAsync(`git -C "${repoPath}" pull`).catch(
          console.log
        )
      }
    } else {
      console.log(`Cloning ${repoName}`)
      const stdout = await cmdAsync(`git clone --mirror ${repo} ${repoPath}.git`).catch(

        console.log
      )
    }

    cloneProgressBar.update(++index)
  }

  cloneProgressBar.stop()
})()
