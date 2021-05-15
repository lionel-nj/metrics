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

import { fetchRawData } from './scripts/FetchRawData'
import { aggregate, merge, removeDirectories } from './scripts/AggregateData'

const DATA = 'data'
const RAW = 'raw'
const TMP = 'tmp'

exports.helloWorld = (req, res) => {
  fetchRawData().then(res.send('hello'))
  merge('transit', 'google', 'MobilityData')
  merge('gbfs', 'NABSA', 'MobilityData')
  aggregate()
  removeDirectories([`${DATA}/${RAW}`, `${DATA}/${TMP}`])
  res.send("Hello world")
}
