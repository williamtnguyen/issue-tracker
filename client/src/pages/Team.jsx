import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext, TeamContext } from '../App';

import Navbar from '../components/material-ui/Navbar';
import TeamList from '../components/material-ui/TeamList';
import ProjectTable from '../components/material-ui/ProjectTable';
import { Container, Button, CircularProgress } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import './Team.scss';

const Team = (props) => {
  const { isAuthenticated, githubUsername } = useContext(UserContext);
  const { setTeamName } = useContext(TeamContext);
  const { history, match } = props;
  const [teamMembers, setTeamMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      history.push('/login');
    } else if (!match.params.teamName) {
      history.push('/dashboard');
    } else {
      setTeamNameGlobally(match.params.teamName);
      fetchTeamInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, isAuthenticated]);

  // Stores selected team name in global state and session storage to persist on page reloads
  const setTeamNameGlobally = (teamName) => {
    setTeamName(teamName);
    sessionStorage.setItem('teamName', teamName);
  };

  const fetchTeamInfo = async () => {
    const teamsApiResponse = await axios.get(
      `/api/teams/${match.params.teamName}`
    );
    const { data } = teamsApiResponse;

    // Assuming team will always have at least 1 member, and projects can be null or array
    setTeamMembers(data.members);
    if (data.projects) {
      // For each project name in teamsApiResponse, make a call to projects API to gather task counts for table
      const projectRows = [];
      for (const projectName of data.projects) {
        const projectsApiResponse = await axios.get(
          `/api/projects/${projectName}`
        );
        const projectInfo = projectsApiResponse.data.issues
          ? {
              name: projectName,
              totalTasks: projectsApiResponse.data.issues.length,
              assignedTasks: projectsApiResponse.data.issues.filter(
                (issueObject) => issueObject.assignees.includes(githubUsername)
              ).length,
              completedTasks: projectsApiResponse.data.issues.filter(
                (issueObject) => issueObject.status === 'DONE'
              ).length,
            }
          : {
              name: projectName,
              totalTasks: 0,
              assignedTasks: 0,
              completedTasks: 0,
            };
        projectRows.push(projectInfo);
      }

      setProjects(projectRows);
    }
    setIsLoadingData(false);
  };

  const goBackToDashboard = () => {
    history.push('/dashboard');
  };

  const goToAddMemberForm = () => {
    history.push({
      pathname: '/team/add-member',
      state: { teamName: match.params.teamName },
    });
  };

  const goToAddProjectForm = () => {
    history.push({
      pathname: '/team/add-project',
      state: { teamName: match.params.teamName },
    });
  };

  return (
    <div>
      <Navbar />
      <Container>
        <div className="team__root">
          <div>
            <Button onClick={goBackToDashboard}>
              <ArrowBackIosIcon />
              Back to dashboard
            </Button>
            <h1>Team Members</h1>
            {isLoadingData ? (
              <div className="loading__container">
                <CircularProgress color="secondary" />
              </div>
            ) : (
              <section className="team__list">
                <TeamList teamMembers={teamMembers} />
              </section>
            )}
            <Button
              onClick={goToAddMemberForm}
              variant="contained"
              color="secondary"
            >
              Add New Member
            </Button>
          </div>
          <div>
            <h1>Projects</h1>
            <section className="team__projects">
              {!isLoadingData && (
                <ProjectTable projects={projects} history={history} />
              )}
            </section>
            <Button
              onClick={goToAddProjectForm}
              variant="contained"
              color="secondary"
            >
              Add New Project
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Team;
