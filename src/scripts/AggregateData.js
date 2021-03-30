const fs = require('fs');
const shell = require('shelljs');
const moment = require("moment");
const MERGED = "merged";

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

function toQuarterYear(date) {
  let quarter = moment(date.toUTCString()).quarter()
  let year = date.getFullYear()
  return `Q${quarter}-${year}`
}

function byQuarterYear(dateCountDict) {
  let toReturn = {}
  for (var i in dateCountDict) {
    if (toQuarterYear(new Date(i)) in toReturn) {
      toReturn[toQuarterYear(new Date(i))] = toReturn[toQuarterYear(
          new Date(i))] + dateCountDict[i]
    } else {
      toReturn[toQuarterYear(new Date(i))] = dateCountDict[i]
    }
  }
  return toReturn
}

async function merge(repo, owner1, owner2) {
  console.log(`Merging data from ${owner1} and ${owner2} ⏳ `)
  shell.mkdir('-p', `data/tmp/${repo}/`);
  let mergedData = {}

  let issueCommentsOwner1 = JSON.parse(
      fs.readFileSync(`data/raw/${owner1}/${repo}/issue_comments.json`))
  let issueCommentsOwner2 = JSON.parse(
      fs.readFileSync(`data/raw/${owner2}/${repo}/issue_comments.json`))
  mergedData[owner1] = issueCommentsOwner1
  mergedData[owner2] = issueCommentsOwner2
  mergedData[MERGED] = issueCommentsOwner1.concat(issueCommentsOwner2)
  fs.writeFileSync(`data/tmp/${repo}/issue_comments.json`,
      JSON.stringify(mergedData))

  let issueCreationOwner1 = JSON.parse(
      fs.readFileSync(`data/raw/${owner1}/${repo}/issue_creation.json`))
  let issueCreationOwner2 = JSON.parse(
      fs.readFileSync(`data/raw/${owner2}/${repo}/issue_creation.json`))
  mergedData[owner1] = issueCreationOwner1
  mergedData[owner2] = issueCreationOwner2
  mergedData[MERGED] = issueCreationOwner1.concat(issueCreationOwner2)
  fs.writeFileSync(`data/tmp/${repo}/issue_creation.json`,
      JSON.stringify(mergedData))

  let prCommentsOwner1 = JSON.parse(
      fs.readFileSync(`data/raw/${owner1}/${repo}/pr_comments.json`))
  let prCommentsOwner2 = JSON.parse(
      fs.readFileSync(`data/raw/${owner2}/${repo}/pr_comments.json`))
  mergedData[owner1] = prCommentsOwner1
  mergedData[owner2] = prCommentsOwner2
  mergedData[MERGED] = prCommentsOwner1.concat(prCommentsOwner2)
  fs.writeFileSync(`data/tmp/${repo}/pr_comments.json`,
      JSON.stringify(mergedData))

  let prMergedOwner1 = JSON.parse(
      fs.readFileSync(`data/raw/${owner1}/${repo}/pr_merged.json`))
  let prMergedOwner2 = JSON.parse(
      fs.readFileSync(`data/raw/${owner2}/${repo}/pr_merged.json`))
  mergedData[owner1] = prMergedOwner1
  mergedData[owner2] = prMergedOwner2
  mergedData[MERGED] = prMergedOwner1.concat(prMergedOwner2)
  fs.writeFileSync(`data/tmp/${repo}/pr_merged.json`,
      JSON.stringify(mergedData))
}

function aggregateDataForSingleOwner(repo, owner) {
  let issueComments = JSON.parse(
      fs.readFileSync(`data/raw/${owner}/${repo}/issue_comments.json`))
  let issueCreation = JSON.parse(
      fs.readFileSync(`data/raw/${owner}/${repo}/issue_creation.json`))
  let prComments = JSON.parse(
      fs.readFileSync(`data/raw/${owner}/${repo}/pr_comments.json`))
  let prMerged = JSON.parse(
      fs.readFileSync(`data/raw/${owner}/${repo}/pr_merged.json`))

  let data = {}
  data[repo] = {}
  data[repo][owner] = {}
  data[repo][owner]["issueCommentsCount"] = byQuarterYear(
      getDateCount(issueComments))
  data[repo][owner]["issueCreationDates"] = byQuarterYear(
      getDateCount(issueCreation))
  data[repo][owner]["prCommentsCount"] = byQuarterYear(
      getDateCount(prComments))
  data[repo][owner]["mergedPrDates"] = byQuarterYear(getDateCount(prMerged))
  fs.writeFileSync(`data/aggregated/${repo}.json`, JSON.stringify(data))
}

function aggregateDataForMultipleOwner(repo, owner1, owner2) {
  let issueComments = JSON.parse(
      fs.readFileSync(`data/tmp/${repo}/issue_comments.json`))
  let issueCreation = JSON.parse(
      fs.readFileSync(`data/tmp/${repo}/issue_creation.json`))
  let prComments = JSON.parse(
      fs.readFileSync(`data/tmp/${repo}/pr_comments.json`))
  let prMerged = JSON.parse(
      fs.readFileSync(`data/tmp/${repo}/pr_merged.json`))

  let data = {}
  data[repo] = {}
  data[repo][owner1] = {}
  data[repo][owner2] = {}
  data[repo][MERGED] = {}
  let owners = [owner1, owner2, MERGED]
  for (let i in owners) {
    owner = owners[i]
    data[repo][owner]["issueCommentsCount"] = byQuarterYear(
        getDateCount(issueComments[owner]))
    data[repo][owner]["issueCreationDates"] = byQuarterYear(
        getDateCount(issueCreation[owner]))
    data[repo][owner]["prCommentsCount"] = byQuarterYear(
        getDateCount(prComments[owner]))
    data[repo][owner]["prMergedDates"] = byQuarterYear(
        getDateCount(prMerged[owner]))
  }
  fs.writeFileSync(`data/aggregated/${repo}.json`, JSON.stringify(data))
}

function aggregate() {
  console.log("Aggregating data ⏳ ")
  shell.mkdir('-p', `data/aggregated/`);
  let singleOwnerRepositories = [{
    repo: "gtfs-validator",
    owner: "MobilityData"
  }]
  let multipleOwnerRepositories = [
    {
      repo: "transit",
      owner1: "MobilityData",
      owner2: "google"
    },
    {
      repo: "gbfs",
      owner1: "MobilityData",
      owner2: "NABSA"
    }
  ]

  // aggregate data for repositories owned by a single organization
  for (let i in singleOwnerRepositories) {
    let repo = singleOwnerRepositories[i].repo
    let owner = singleOwnerRepositories[i].owner
    aggregateDataForSingleOwner(repo, owner)
  }
  // aggregate data for repositories owned by a two organization
  for (let i in multipleOwnerRepositories) {
    let repo = multipleOwnerRepositories[i].repo
    let owner1 = multipleOwnerRepositories[i].owner1
    let owner2 = multipleOwnerRepositories[i].owner2
    aggregateDataForMultipleOwner(repo, owner1, owner2)
  }
}

function removeDirectories(dir1, dir2) {
  console.log("Removing temporary data files 🌬 ")
  dirs = [dir1, dir2]
  for (let i in dirs) {
    dir = dirs[i]
    fs.rmdir(dir, {recursive: true}, (err) => {
          if (err) {
            throw err;
          }
        }
    )
  }
}

merge("transit", "google", "MobilityData");
merge("gbfs", "NABSA", "MobilityData");
aggregate()
removeDirectories("data/raw", "data/tmp")
