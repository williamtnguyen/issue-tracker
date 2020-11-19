import React, { createContext, useState } from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CreateTeamForm from './pages/CreateTeamForm';
import JoinTeamForm from './pages/JoinTeamForm';
import ProjectBoard from './pages/ProjectBoard';

export const UserContext = createContext();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.githubUsername ? true : false
  );
  const [githubUsername, setGithubUsername] = useState(
    localStorage.githubUsername ? localStorage.githubUsername : ''
  );

  const userContext = {
    isAuthenticated,
    setIsAuthenticated,
    githubUsername,
    setGithubUsername,
  };

  return (
    <Router>
      <UserContext.Provider value={userContext}>
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
        <Route exact path="/login" component={Landing} />
        <Route exact path="/dashboard" component={Dashboard} />
        <Route exact path="/team/create" component={CreateTeamForm} />
        <Route exact path="/team/join" component={JoinTeamForm} />
        <Route exact path="/project/:projectId" component={ProjectBoard} />
      </UserContext.Provider>
    </Router>
  );
};

export default App;
