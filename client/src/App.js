import React, { createContext, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CreateTeamForm from './pages/forms/CreateTeamForm';
import JoinTeamForm from './pages/forms/JoinTeamForm';
import Team from './pages/Team';
import AddMemberForm from './pages/forms/AddMemberForm';
import AddProjectForm from './pages/forms/AddProjectForm';
import ProjectBoard from './pages/ProjectBoard';
import TaskToGithub from './pages/forms/CreateTaskForm';
import searchResults from './pages/SearchResults';

export const UserContext = createContext();
export const TeamContext = createContext();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.githubUsername,
  );
  const [githubUsername, setGithubUsername] = useState(
    localStorage.githubUsername ? localStorage.githubUsername : '',
  );
  const [teamName, setTeamName] = useState(
    sessionStorage.teamName ? sessionStorage.teamName : '',
  );

  const userContext = {
    isAuthenticated,
    setIsAuthenticated,
    githubUsername,
    setGithubUsername,
  };
  const teamContext = {
    teamName,
    setTeamName,
  };

  return (
    <Router>
      <UserContext.Provider value={userContext}>
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
        <Route exact path="/login" component={Landing} />
        <Route exact path="/dashboard" component={Dashboard} />
        <TeamContext.Provider value={teamContext}>
          <Switch>
            <Route exact path="/team/create" component={CreateTeamForm} />
            <Route exact path="/team/join" component={JoinTeamForm} />
            <Route exact path="/team/add-member" component={AddMemberForm} />
            <Route exact path="/team/add-project" component={AddProjectForm} />
            <Route exact path="/team/:teamName" component={Team} />
          </Switch>
          <Switch>
            <Route exact path="/project/add-task" component={TaskToGithub} />
            <Route
              exact
              path="/project/:projectName"
              component={ProjectBoard}
            />
          </Switch>
        </TeamContext.Provider>
      </UserContext.Provider>
    </Router>
  );
};

export default App;
