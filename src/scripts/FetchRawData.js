require('dotenv').config();
const fs = require('fs');
const shell = require('shelljs');

const {Octokit} = require("@octokit/rest");
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
  },
})

let ascOrder = function (firstDate, otherDate) {
  if (firstDate > otherDate) {
    return 1
  }
  if (firstDate < otherDate) {
    return -1
  }
}

async function getAllPrMergeDatesCollection(repository, owner) {
  let toReturn = []
  return await octokit.paginate("GET /repos/{owner}/{repo}/pulls", {
    owner: owner,
    repo: repository,
    state: 'all',
    per_page: 100
  }).then(res => {
    let filteredData = res.filter(item => item.merged_at !== null);
    for (let i in filteredData) {
      let date = new Date(filteredData[i].merged_at)
      toReturn.push(
          new Date(date.getFullYear(), date.getMonth(), date.getDate()))
    }
    return toReturn.sort(ascOrder)
  })
}

async function getAllIssueCreationDateCollection(repository, owner) {
  let toReturn = []
  return await octokit.paginate(octokit.issues.listForRepo, {
    owner: owner,
    repo: repository,
    state: 'all',
    per_page: 100
  }).then(res => {
    for (let i in res) {
      let date = new Date(res[i].created_at)
      toReturn.push(
          new Date(date.getFullYear(), date.getMonth(), date.getDate()))
    }
    return toReturn.sort(ascOrder)
  })
}

async function getAllIssueCommentForRepo(repository, owner) {
  let toReturn = []
  return await octokit.paginate(octokit.issues.listCommentsForRepo, {
    owner: owner,
    repo: repository,
    per_page: 100
  }).then(res => {
    for (let i in res) {
      let date = new Date(res[i].created_at)
      toReturn.push(
          new Date(date.getFullYear(), date.getMonth(), date.getDate()))
    }
    return toReturn.sort(ascOrder)
  })
}

async function getAllPrCommentForRepo(repository, owner) {
  let toReturn = []
  return await octokit.paginate("GET /repos/{owner}/{repo}/pulls/comments", {
    owner: owner,
    repo: repository,
    per_page: 100
  }).then(res => {
    for (let i in res) {
      let date = new Date(res[i].created_at)
      toReturn.push(
          new Date(date.getFullYear(), date.getMonth(), date.getDate()))
    }
    return toReturn.sort(ascOrder)
  })
}

let repositories = [
  {
    repo: "gtfs-validator",
    owner: "MobilityData",
    direction: "https://github.com/MobilityData/gtfs-validator"
  },
  {
    repo: "transit",
    owner: "MobilityData",
    direction: "https://github.com/MobilityData/transit"
  },
  {
    repo: "transit",
    owner: "google",
    direction: "https://github.com/google/transit"
  },
  {
    repo: "gbfs",
    owner: "NABSA",
    direction: "https://github.com/nabsa/gbfs"
  },
  {
    repo: "gbfs",
    owner: "MobilityData",
    direction: "https://github.com/MobilityData/gbfs"
  }
]

async function fetchRawData() {
  console.log("Fetching raw data from Github ⏳ ")
  for (let i in repositories) {
    let repository = repositories[i]
    let repo = repository.repo
    let owner = repository.owner

    shell.mkdir('-p', `data/raw/${owner}/${repo}/`);
    await getAllIssueCreationDateCollection(repo, owner)
    .then(issueCreationData => {
      fs.writeFileSync(`data/raw/${owner}/${repo}/issue_creation.json`,
          JSON.stringify(issueCreationData))
    }).catch(error => console.log(error))

    await getAllPrMergeDatesCollection(repo, owner)
    .then(issueCreationData => {
      fs.writeFileSync(`data/raw/${owner}/${repo}/pr_merged.json`,
          JSON.stringify(issueCreationData))
    }).catch(error => console.log(error))

    await getAllIssueCommentForRepo(repo, owner)
    .then(issueCreationData => {
      fs.writeFileSync(`data/raw/${owner}/${repo}/issue_comments.json`,
          JSON.stringify(issueCreationData))
    }).catch(error => console.log(error))

    await getAllPrCommentForRepo(repo, owner)
    .then(issueCreationData => {
      fs.writeFileSync(`data/raw/${owner}/${repo}/pr_comments.json`,
          JSON.stringify(issueCreationData))
    }).catch(error => console.log(error))

    console.log(`🗄 Repository: ${repo}`)
    console.log(`🏡 Owner: ${owner}`)
    console.log(`🔗 Link: ${repository.direction}`)
    console.log(`\n`)
  }
}

fetchRawData()
