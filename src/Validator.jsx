import React from "react";
import * as Plotly from "plotly.js";
import Plot from 'react-plotly.js';

function Validator() {
  // let openedIssueData =
  // let mergedPrData =
  // let issueCommentData =
  // let prCommentData =
  let xList = [2, 6, 3]
  let yList = [2, 6, 3]
  return (
      <div className="validator">
        <h1 className="font-weight-light"><a
            href="https://github.com/MobilityData/gtfs-validator">MobilityData/gtfs-validator</a></h1>
        <div className="grid-container">
          <div className="top-left" id="validator-open-issues">
            <Plot
                data={[
                  {
                    x: xList,
                    y: yList,
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: {color: 'red'},
                  },
                ]}
                layout={ {title: 'Opened issue count'} }
            />
          </div>
          <div className="top-right" id='validator-merged-prs'>
            <Plot
                data={[
                  {
                    x: xList,
                    y: yList,
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: {color: 'red'},
                  },
                ]}
                layout={ {title: 'Merged PRs count'} }
            />
          </div>
          <div className="middle-left" id='validator-top-issue'></div>
          <div className="middle-right" id='validator-top-pr'><p id='x'>33 ⭐</p>️</div>
          <div className="bottom" id='validator-comments'>
            <Plot
              data={[
                {
                  x: xList,
                  y: yList,
                  type: 'scatter',
                  mode: 'lines+markers',
                  marker: {color: 'red'},
                },
              ]}
              layout={ {title: 'Comment count'} }
          /></div>
        </div>
      </div>
  );
}

export default Validator;
