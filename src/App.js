import React from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";

import "./style/styles.css";
import SideBar from "./components/sidebar";
import Home from "./Home";
import Gtfs from "./Gtfs";
import Gbfs from "./Gbfs";
import Validator from "./Validator";

function App() {
  return (
      <div id="App">

        <SideBar pageWrapId={"page-wrap"} outerContainerId={"App"}/>

        <div id="page-wrap">
          <Router>
            <Switch>
              <Route path="/" exact component={() => <Home/>}/>
              <Route path="/gtfs" exact component={() => <Gtfs/>}/>
              <Route path="/gbfs" exact component={() => <Gbfs/>}/>
              <Route path="/validator" exact
                     component={() => <Validator/>}/>
            </Switch>
          </Router>


        </div>
      </div>
  );
}

export default App;
