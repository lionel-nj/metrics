import React, {useRef, useState} from 'react';
import {ThemeProvider} from 'styled-components';
import {useOnClickOutside} from './hooks';
import {GlobalStyles} from './global';
import {theme} from './theme';
import {Burger, Menu} from './components';
import FocusLock from 'react-focus-lock';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from "./Home";
import Gtfs from "./Gtfs";
import Gbfs from "./Gbfs";
import Validator from "./Validator";

function App() {
  const [open, setOpen] = useState(false);
  const node = useRef();
  const menuId = "main-menu";

  useOnClickOutside(node, () => setOpen(false));

  return (
      <ThemeProvider theme={theme}>
        <>
          <GlobalStyles/>
          <div ref={node}>
            <Router>
              <FocusLock disabled={!open}>
                <Burger open={open} setOpen={setOpen} aria-controls={menuId}/>
                <Menu open={open} setOpen={setOpen} id={menuId}/>
                <Switch>
                  <Route path="/" exact component={() => <Home/>}/>
                  <Route path="/gtfs" exact component={() => <Gtfs/>}/>
                  <Route path="/gbfs" exact component={() => <Gbfs/>}/>
                  <Route path="/validator" exact
                         component={() => <Validator/>}/>
                </Switch>
              </FocusLock>
            </Router>
          </div>
        </>
      </ThemeProvider>
  );
}

export default App;
