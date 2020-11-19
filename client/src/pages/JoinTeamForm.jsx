import React, { useEffect, useContext, useState } from 'react';
import { UserContext } from '../App';
import axios from 'axios';

import { TextField, Button } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Navbar from '../components/material-ui/Navbar';
import './JoinTeamForm.scss';

const JoinTeamForm = (props) => {
  const { isAuthenticated, githubUsername } = useContext(UserContext);
  const { history } = props;
  const [teamName, setTeamName] = useState('');
  const [notExistsError, setNotExistsError] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      history.push('/login');
    }
  }, [history, isAuthenticated]);

  const goBackToDashboard = () => {
    history.push('/dashboard');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const newTeamName = await axios.post('/api/teams/join', {
        teamName: teamName,
        joiningUsername: githubUsername,
      });
      if (newTeamName) {
        goBackToDashboard();
      }
    } catch (error) {
      setNotExistsError(true);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="join__team__root">
        <div>
          <Button onClick={goBackToDashboard}>
            <ArrowBackIosIcon />
            Back to dashboard
          </Button>
          <h1>Please enter team name to join:</h1>
          <p>Accomplish more with your team using trackr ©.</p>
          {notExistsError && (
            <p className="error__message">Team name does not exist</p>
          )}
          <form onSubmit={handleSubmit} noValidate autoComplete="off">
            <TextField
              onChange={(event) => setTeamName(event.target.value)}
              id="outlined-secondary"
              label="Team name..."
              variant="outlined"
              color="secondary"
              fullWidth={true}
              style={{ marginBottom: '30px' }}
            />
            <Button variant="contained" color="secondary" type="submit">
              Join Team
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinTeamForm;
