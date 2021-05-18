/**
 * HTTP Cloud Function.
 * This function is exported by index.js, and is executed when
 * you make an HTTP request to the deployed function's endpoint.
 *
 * @param {Object} req Cloud Function request context.
 *                     More info: https://expressjs.com/en/api.html#req
 * @param {Object} res Cloud Function response context.
 *                     More info: https://expressjs.com/en/api.html#res
 */
const REPOS = 'repos'
const COMMENTS = 'comments'
const PULLS = 'pulls'
const ISSUE_CREATION_JSON = 'issue_creation.json'
const PR_MERGED_JSON = 'pr_merged.json'
const ISSUE_COMMENTS_JSON = 'issue_comments.json'
const PR_COMMENTS_JSON = 'pr_comments.json'
const OPEN_ISSUE_JSON = 'open_issues_count.json'
const OPEN_PR_JSON = 'open_pulls_count.json'
const DATA = 'data'
const RAW = 'raw'
const TMP = 'tmp'

const STATE_OPEN = 'open'
const MERGED = 'merged'
const ISSUE_COMMENTS_COUNT = 'issueCommentsCount'
const ISSUE_CREATION_DATES = 'issueCreationDates'
const PR_COMMENTS_COUNT = 'prCommentsCount'
const MERGED_PR_DATES = 'mergedPrDates'
const AGGREGATED = 'aggregated'
const JSON_EXTENSION = '.json'


import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('dotenv').config()

const fs = require('fs')
const shell = require('shelljs')
const moment = require('moment')

const { Octokit } = require('@octokit/rest')

const octokit = new Octokit({
  auth: process.env.GH_TOKEN,
  baseUrl: 'https://api.github.com',
  log: {
    debug: () => {
    },
    info: () => {
    },
    warn: console.warn,
    error: console.error
  }
})

export function helloWorld(req, res)  {
  fetchRawData().then(res.send('hello'))
  merge('transit', 'google', 'MobilityData')
  merge('gbfs', 'NABSA', 'MobilityData')
  aggregate()
  removeDirectories([`${DATA}/${RAW}`, `${DATA}/${TMP}`])
  res.send("Hello world")
}




const ascOrder = function (firstDate, otherDate) {
  if (firstDate > otherDate) {
    return 1
  }
  if (firstDate < otherDate) {
    return -1
  }
}

async function getPullCountForRepo (repository, owner, state) {
  return await octokit.paginate(octokit.issues.listForRepo, {
    owner: owner,
    repo: repository,
    state: state,
    per_page: 100
  }).then(res => {
    return res.filter(item => item.pull_request != null).length
  })
}

async function getIssueCountForRepo (repository, owner, state) {
  return await octokit.paginate(octokit.issues.listForRepo, {
    owner: owner,
    repo: repository,
    state: state,
    per_page: 100
  }).then(res => {
    return res.filter(item => item.pull_request == null).length
  })
}

async function getAllPrMergeDatesCollection (repository, owner) {
  const toReturn = []
  return await octokit.paginate(`GET /${REPOS}/{owner}/{repo}/${PULLS}`, {
    owner: owner,
    repo: repository,
    state: 'all',
    per_page: 100
  }).then(res => {
    const filteredData = res.filter(item => item.merged_at !== null)
    for (const i in filteredData) {
      const date = new Date(filteredData[i].merged_at)
      toReturn.push(
          new Date(date.getFullYear(), date.getMonth(), date.getDate()))
    }
    return toReturn.sort(ascOrder)
  })
}

async function getAllIssueCreationDateCollection (repository, owner) {
  const toReturn = []
  return await octokit.paginate(octokit.issues.listForRepo, {
    owner: owner,
    repo: repository,
    state: 'all',
    per_page: 100
  }).then(res => {
    for (const i in res) {
      const date = new Date(res[i].created_at)
      toReturn.push(
          new Date(date.getFullYear(), date.getMonth(), date.getDate()))
    }
    return toReturn.sort(ascOrder)
  })
}

async function getAllIssueCommentForRepo (repository, owner) {
  const toReturn = []
  return await octokit.paginate(octokit.issues.listCommentsForRepo, {
    owner: owner,
    repo: repository,
    per_page: 100
  }).then(res => {
    for (const i in res) {
      const date = new Date(res[i].created_at)
      toReturn.push(
          new Date(date.getFullYear(), date.getMonth(), date.getDate()))
    }
    return toReturn.sort(ascOrder)
  })
}

async function getAllPrCommentForRepo (repository, owner) {
  const toReturn = []
  return await octokit.paginate(`GET /${REPOS}/{owner}/{repo}/${PULLS}/${COMMENTS}`, {
    owner: owner,
    repo: repository,
    per_page: 100
  }).then(res => {
    for (const i in res) {
      const date = new Date(res[i].created_at)
      toReturn.push(
          new Date(date.getFullYear(), date.getMonth(), date.getDate()))
    }
    return toReturn.sort(ascOrder)
  })
}

const repositories = [
  {
    repo: 'gtfs-validator',
    owner: 'MobilityData',
    direction: 'https://github.com/MobilityData/gtfs-validator'
  },
  {
    repo: 'transit',
    owner: 'MobilityData',
    direction: 'https://github.com/MobilityData/transit'
  },
  {
    repo: 'transit',
    owner: 'google',
    direction: 'https://github.com/google/transit'
  },
  {
    repo: 'gbfs',
    owner: 'NABSA',
    direction: 'https://github.com/nabsa/gbfs'
  },
  {
    repo: 'gbfs',
    owner: 'MobilityData',
    direction: 'https://github.com/MobilityData/gbfs'
  }
]

export async function fetchRawData () {
  console.log('Fetching raw data from Github ⏳ ')
  for (const i in repositories) {
    const repository = repositories[i]
    const repo = repository.repo
    const owner = repository.owner

    shell.mkdir('-p', `${DATA}/${RAW}/${owner}/${repo}/`)
    await getAllIssueCreationDateCollection(repo, owner)
    .then(issueCreationData => {
      fs.writeFileSync(`${DATA}/${RAW}/${owner}/${repo}/${ISSUE_CREATION_JSON}`,
          JSON.stringify(issueCreationData))
    }).catch(error => console.log(error))

    await getAllPrMergeDatesCollection(repo, owner)
    .then(issueCreationData => {
      fs.writeFileSync(`${DATA}/${RAW}/${owner}/${repo}/${PR_MERGED_JSON}`,
          JSON.stringify(issueCreationData))
    }).catch(error => console.log(error))

    await getAllIssueCommentForRepo(repo, owner)
    .then(issueCreationData => {
      fs.writeFileSync(`${DATA}/${RAW}/${owner}/${repo}/${ISSUE_COMMENTS_JSON}`,
          JSON.stringify(issueCreationData))
    }).catch(error => console.log(error))

    await getAllPrCommentForRepo(repo, owner)
    .then(issueCreationData => {
      fs.writeFileSync(`${DATA}/${RAW}/${owner}/${repo}/${PR_COMMENTS_JSON}`,
          JSON.stringify(issueCreationData))
    }).catch(error => console.log(error))

    await getIssueCountForRepo(repo, owner, STATE_OPEN)
    .then(openIssueCount => {
      fs.writeFileSync(`${DATA}/${RAW}/${owner}/${repo}/${OPEN_ISSUE_JSON}`,
          JSON.stringify(openIssueCount))
    }).catch(error => console.log(error))

    await getPullCountForRepo(repo, owner, STATE_OPEN)
    .then(openPullCount => {
      fs.writeFileSync(`${DATA}/${RAW}/${owner}/${repo}/${OPEN_PR_JSON}`,
          JSON.stringify(openPullCount))
    }).catch(error => console.log(error))

    console.log(`🗄 Repository: ${repo}`)
    console.log(`🏡 Owner: ${owner}`)
    console.log(`🔗 Link: ${repository.direction}`)
    console.log('\n')
  }
}

function getDateCount (dateList) {
  const toReturn = {}
  for (const i in dateList) {
    if (dateList[i] in toReturn) {
      toReturn[dateList[i]] = toReturn[dateList[i]] + 1
    } else {
      toReturn[dateList[i]] = 1
    }
  }
  return toReturn
}

function toQuarterYear (date) {
  const quarter = moment(date.toUTCString()).quarter()
  const year = date.getFullYear()
  return `Q${quarter}-${year}`
}

function byQuarterYear (dateCountDict) {
  const toReturn = {}
  for (const i in dateCountDict) {
    if (toQuarterYear(new Date(i)) in toReturn) {
      toReturn[toQuarterYear(new Date(i))] = toReturn[toQuarterYear(
          new Date(i))] + dateCountDict[i]
    } else {
      toReturn[toQuarterYear(new Date(i))] = dateCountDict[i]
    }
  }
  return toReturn
}

async function merge (repo, owner1, owner2) {
  console.log(`Merging data from ${owner1} and ${owner2} ⏳ `)
  shell.mkdir('-p', `${DATA}/${TMP}/${repo}/`)
  const mergedData = {}

  const issueCommentsOwner1 = JSON.parse(
      fs.readFileSync(`${DATA}/${RAW}/${owner1}/${repo}/${ISSUE_COMMENTS_JSON}`))
  const issueCommentsOwner2 = JSON.parse(
      fs.readFileSync(`${DATA}/${RAW}/${owner2}/${repo}/${ISSUE_COMMENTS_JSON}`))
  mergedData[owner1] = issueCommentsOwner1
  mergedData[owner2] = issueCommentsOwner2
  mergedData[MERGED] = issueCommentsOwner1.concat(issueCommentsOwner2)
  fs.writeFileSync(`${DATA}/${TMP}/${repo}/${ISSUE_COMMENTS_JSON}`,
      JSON.stringify(mergedData))

  const issueCreationOwner1 = JSON.parse(
      fs.readFileSync(`${DATA}/${RAW}/${owner1}/${repo}/${ISSUE_CREATION_JSON}`))
  const issueCreationOwner2 = JSON.parse(
      fs.readFileSync(`${DATA}/${RAW}/${owner2}/${repo}/${ISSUE_CREATION_JSON}`))
  mergedData[owner1] = issueCreationOwner1
  mergedData[owner2] = issueCreationOwner2
  mergedData[MERGED] = issueCreationOwner1.concat(issueCreationOwner2)
  fs.writeFileSync(`${DATA}/${TMP}/${repo}/${ISSUE_CREATION_JSON}`,
      JSON.stringify(mergedData))

  const prCommentsOwner1 = JSON.parse(
      fs.readFileSync(`${DATA}/${RAW}/${owner1}/${repo}/${PR_COMMENTS_JSON}`))
  const prCommentsOwner2 = JSON.parse(
      fs.readFileSync(`${DATA}/${RAW}/${owner2}/${repo}/${PR_COMMENTS_JSON}`))
  mergedData[owner1] = prCommentsOwner1
  mergedData[owner2] = prCommentsOwner2
  mergedData[MERGED] = prCommentsOwner1.concat(prCommentsOwner2)
  fs.writeFileSync(`${DATA}/${TMP}/${repo}/${PR_COMMENTS_JSON}`,
      JSON.stringify(mergedData))

  const prMergedOwner1 = JSON.parse(
      fs.readFileSync(`${DATA}/${RAW}/${owner1}/${repo}/${PR_MERGED_JSON}`))
  const prMergedOwner2 = JSON.parse(
      fs.readFileSync(`${DATA}/${RAW}/${owner2}/${repo}/${PR_MERGED_JSON}`))
  mergedData[owner1] = prMergedOwner1
  mergedData[owner2] = prMergedOwner2
  mergedData[MERGED] = prMergedOwner1.concat(prMergedOwner2)
  fs.writeFileSync(`${DATA}/${TMP}/${repo}/${PR_MERGED_JSON}`,
      JSON.stringify(mergedData))
}

function aggregateDataForSingleOwner (repo, owner) {
  const issueComments = JSON.parse(
      fs.readFileSync(`${DATA}/${RAW}/${owner}/${repo}/${ISSUE_COMMENTS_JSON}`))
  const issueCreation = JSON.parse(
      fs.readFileSync(`${DATA}/${RAW}/${owner}/${repo}/${ISSUE_CREATION_JSON}`))
  const prComments = JSON.parse(
      fs.readFileSync(`${DATA}/${RAW}/${owner}/${repo}/${PR_COMMENTS_JSON}`))
  const prMerged = JSON.parse(
      fs.readFileSync(`${DATA}/${RAW}/${owner}/${repo}/${PR_MERGED_JSON}`))

  const data = {}
  data[repo] = {}
  data[repo][owner] = {}
  data[repo][owner][ISSUE_COMMENTS_COUNT] = byQuarterYear(
      getDateCount(issueComments))
  data[repo][owner][ISSUE_CREATION_DATES] = byQuarterYear(
      getDateCount(issueCreation))
  data[repo][owner][PR_COMMENTS_COUNT] = byQuarterYear(
      getDateCount(prComments))
  data[repo][owner][MERGED_PR_DATES] = byQuarterYear(getDateCount(prMerged))
  fs.writeFileSync(`${DATA}/${AGGREGATED}/${repo}${JSON_EXTENSION}`, JSON.stringify(data))
}

function aggregateDataForMultipleOwner (repo, owner1, owner2) {
  const issueComments = JSON.parse(
      fs.readFileSync(`${DATA}/${TMP}/${repo}/${ISSUE_COMMENTS_JSON}`))
  const issueCreation = JSON.parse(
      fs.readFileSync(`${DATA}/${TMP}/${repo}/${ISSUE_CREATION_JSON}`))
  const prComments = JSON.parse(
      fs.readFileSync(`${DATA}/${TMP}/${repo}/${PR_COMMENTS_JSON}`))
  const prMerged = JSON.parse(
      fs.readFileSync(`${DATA}/${TMP}/${repo}/${PR_MERGED_JSON}`))

  const data = {}
  data[repo] = {}
  data[repo][owner1] = {}
  data[repo][owner2] = {}
  data[repo][MERGED] = {}
  const owners = [owner1, owner2, MERGED]
  for (const i in owners) {
    const owner = owners[i]
    data[repo][owner][ISSUE_COMMENTS_COUNT] = byQuarterYear(
        getDateCount(issueComments[owner]))
    data[repo][owner][ISSUE_CREATION_DATES] = byQuarterYear(
        getDateCount(issueCreation[owner]))
    data[repo][owner][PR_COMMENTS_COUNT] = byQuarterYear(
        getDateCount(prComments[owner]))
    data[repo][owner][MERGED_PR_DATES] = byQuarterYear(
        getDateCount(prMerged[owner]))
  }
  fs.writeFileSync(`${DATA}/${AGGREGATED}/${repo}${JSON_EXTENSION}`, JSON.stringify(data))
}

function aggregate () {
  console.log('Aggregating data ⏳ ')
  shell.mkdir('-p', `${DATA}/${AGGREGATED}/`)
  const singleOwnerRepositories = [{
    repo: 'gtfs-validator',
    owner: 'MobilityData'
  }]
  const multipleOwnerRepositories = [
    {
      repo: 'transit',
      owner1: 'MobilityData',
      owner2: 'google'
    },
    {
      repo: 'gbfs',
      owner1: 'MobilityData',
      owner2: 'NABSA'
    }
  ]

  // aggregate data for repositories owned by a single organization
  for (const i in singleOwnerRepositories) {
    const repo = singleOwnerRepositories[i].repo
    const owner = singleOwnerRepositories[i].owner
    aggregateDataForSingleOwner(repo, owner)
  }
  // aggregate data for repositories owned by a two organization
  for (const i in multipleOwnerRepositories) {
    const repo = multipleOwnerRepositories[i].repo
    const owner1 = multipleOwnerRepositories[i].owner1
    const owner2 = multipleOwnerRepositories[i].owner2
    aggregateDataForMultipleOwner(repo, owner1, owner2)
  }
}

function removeDirectories (dirs) {
  console.log('Removing temporary data files 🌬 ')
  for (const i in dirs) {
    const dir = dirs[i]
    fs.rmdir(dir, { recursive: true }, (err) => {
          if (err) {
            throw err
          }
        }
    )
  }
}
