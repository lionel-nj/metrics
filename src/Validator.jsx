import React from "react";
import {Octokit} from "@octokit/rest";
const REACT_APP_GH_TOKEN = process.env.REACT_APP_GH_TOKEN

function Validator() {
  const octokit = new Octokit({
    auth: REACT_APP_GH_TOKEN,
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

  async function getAllPrMergeDatesCollection() {
    let toReturn = []
    return await octokit.paginate("GET /repos/{owner}/{repo}/pulls", {
      owner: 'MobilityData',
      repo: 'gtfs-validator',
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

  async function getAllIssueCreationDateCollection() {
    let toReturn = []
    return await octokit.paginate(octokit.issues.listForRepo, {
      owner: 'MobilityData',
      repo: 'gtfs-validator',
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

  async function getAllIssueCommentForRepo() {
    let toReturn = []
    return await octokit.paginate(octokit.issues.listCommentsForRepo, {
      owner: 'MobilityData',
      repo: 'gtfs-validator'
    }).then(res => {
      for (let i in res) {
        let date = new Date(res[i].created_at)
        toReturn.push(
            new Date(date.getFullYear(), date.getMonth(), date.getDate()))
      }
      return toReturn
    })
  }

  async function getAllPrCommentForRepo() {
    let toReturn = []
    return await octokit.paginate("GET /repos/{owner}/{repo}/pulls/comments", {
      owner: 'MobilityData',
      repo: 'gtfs-validator'
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
    console.log(toReturn)
    return toReturn
  }



  // getAllPrCommentForRepo().then(res => {
  //   getDateCount(res)
  // })

  // getAllIssueCommentForRepo().then(res => {
  //   getDateCount(res)
  // })
  //
  getAllPrMergeDatesCollection().then(res => {
    getDateCount(res)
  })

  // getAllIssueCreationDateCollection().then(res => {
  //   getDateCount(res)
  // })

  return (
      <div className="about">
        <div class="container">
          <div class="row align-items-center my-5">
            <div class="col-lg-7">
              <img
                  class="img-fluid rounded mb-4 mb-lg-0"
                  src="http://placehold.it/900x400"
                  alt=""
              />
            </div>
            <div class="col-lg-5">
              <h1 class="font-weight-light">About</h1>
              <p>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text
                ever since the 1500s, when an unknown printer took a galley of
                type and scrambled it to make a type specimen book.
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Validator;
