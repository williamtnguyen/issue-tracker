import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../App';

import Navbar from '../components/material-ui/Navbar';
import TeamList from '../components/material-ui/TeamList';
import ProjectTable from '../components/material-ui/ProjectTable';
import { Container, Button, CircularProgress } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import './Team.scss';

const Team = (props) => {
  const { isAuthenticated } = useContext(UserContext);
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
      fetchTeamInfo();
      console.log('was triggered');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTeamInfo = async () => {
    const apiResponse = await axios.get(`/api/teams/${match.params.teamName}`);
    const { data } = apiResponse;

    // Assuming team will always have at least 1 member
    setTeamMembers(data.members);
    if (data.projects) {
      setProjects(data.projects);
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
              <ProjectTable projects={projects} />
            </section>
            <Button variant="contained" color="secondary">
              Add New Project
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Team;
