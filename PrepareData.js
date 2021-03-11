require('dotenv').config();

const { Octokit } = require("@octokit/rest");
const GH_TOKEN = process.env.GH_TOKEN

const octokit = new Octokit({
  auth: GH_TOKEN,
  baseUrl: 'https://api.github.com',
  log: {
    debug: () => {
    },
    info: () => {
    },
    warn: console.warn,
    error: console.error
  },
})

async function getAllPrMergeDatesCollection(repository) {
  let toReturn = []
  return await octokit.paginate("GET /repos/{owner}/{repo}/pulls", {
    owner: 'MobilityData',
    repo: repository,
    state: 'all'
  }).then(res => {
    let filteredData = res.filter(item => item.merged_at !== null);
    for (let i in filteredData) {
      let date = new Date(filteredData[i].merged_at)
      toReturn.push(
          new Date(date.getFullYear(), date.getMonth(), date.getDate()))
    }
    return toReturn
  })
}

async function getAllIssueCreationDateCollection(repository) {
  let toReturn = []
  return await octokit.paginate(octokit.issues.listForRepo, {
    owner: 'MobilityData',
    repo: repository,
    state: 'all',
  }).then(res => {
    for (let i in res) {
      let date = new Date(res[i].created_at)
      toReturn.push(
          new Date(date.getFullYear(), date.getMonth(), date.getDate()))
    }
    return toReturn
  })
}

async function getAllIssueCommentForRepo(repository) {
  let toReturn = []
  return await octokit.paginate(octokit.issues.listCommentsForRepo, {
    owner: 'MobilityData',
    repo: repository
  }).then(res => {
    for (let i in res) {
      let date = new Date(res[i].created_at)
      toReturn.push(
          new Date(date.getFullYear(), date.getMonth(), date.getDate()))
    }
    return toReturn
  })
}

async function getAllPrCommentForRepo(repository) {
  let toReturn = []
  return await octokit.paginate("GET /repos/{owner}/{repo}/pulls/comments", {
    owner: 'MobilityData',
    repo: repository
  }).then(res => {
    for (let i in res) {
      let date = new Date(res[i].created_at)
      toReturn.push(
          new Date(date.getFullYear(), date.getMonth(), date.getDate()))
    }
    return toReturn
  })
}

function getDateCount(dateList) {
  let toReturn = {}
  for (let i in dateList) {
    if (dateList[i] in toReturn) {
      toReturn[dateList[i]] = toReturn[dateList[i]] + 1
    } else {
      toReturn[dateList[i]] = 1
    }
  }
  return toReturn
}
