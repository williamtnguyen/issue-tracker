import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../App';

import Navbar from '../components/material-ui/Navbar';
import DashboardTable from '../components/material-ui/DashboardTable';
import { Container, Button, CircularProgress } from '@material-ui/core';
import './Dashboard.scss';

const Dashboard = (props) => {
  const { isAuthenticated, githubUsername } = useContext(UserContext);
  const { history } = props;
  const [avatarSourceURL, setAvatarSourceURL] = useState('');
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [repoCount, setRepoCount] = useState(0);
  const [teams, setTeams] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const { history } = props;
    if (!isAuthenticated) {
      history.push('/login');
    } else {
      fetchUserInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props, isAuthenticated]);

  const fetchUserInfo = async () => {
    const apiResponse = await axios.get(`/api/users/${githubUsername}`);
    const { data } = apiResponse;

    setAvatarSourceURL(data.avatarSourceURL);
    setFollowerCount(data.followerCount);
    setFollowingCount(data.followingCount);
    setRepoCount(data.repoCount);
    setTeams(data.teams);
    setIsLoadingData(false);
  };

  const goToCreateTeamForm = () => {
    history.push('/team/create');
  };

  const goToJoinTeamForm = () => {
    history.push('/team/join');
  };

  return (
    <div>
      <Navbar />
      <Container>
        <div className="dashboard__root">
          <div>
            {isLoadingData ? (
              <CircularProgress
                color="secondary"
                style={{ marginBottom: '50px' }}
              />
            ) : (
              <img
                className="github__avatar"
                src={avatarSourceURL}
                alt="avatar"
              />
            )}
            <h1>{githubUsername}</h1>
            <div className="follow__counts">
              <h4>{followerCount} followers</h4>
              <h4>{followingCount} following</h4>
            </div>
            <h4>{repoCount} repositories</h4>
          </div>
          <div>
            <h1>Current Teams</h1>
            <DashboardTable teams={teams} />
            <div className="team__crud-buttons">
              <Button
                onClick={goToCreateTeamForm}
                variant="contained"
                color="primary"
              >
                Create Team
              </Button>
              <Button
                onClick={goToJoinTeamForm}
                variant="contained"
                color="primary"
              >
                Join Team
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Dashboard;
