import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';

import Landing from './components/Landing';
import ProjectBoard from './components/ProjectBoard';

function App() {
  return (
    <Router>
      <Route exact path="/">
        <Redirect to="/login"></Redirect>
      </Route>
      <Route exact path="/login" component={Landing} />
      <Route exact path="/dashboard" component={ProjectBoard} />
    </Router>
  );
}

export default App;
