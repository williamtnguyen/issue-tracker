import React, { useEffect, useContext, useState } from 'react';
import { UserContext } from '../../App';
import axios from 'axios';

import { TextField, Button } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Navbar from '../../components/material-ui/Navbar';
import './CreateTeamForm.scss';

const CreateTeamForm = (props) => {
  const { isAuthenticated, githubUsername } = useContext(UserContext);
  const { history } = props;
  const [teamName, setTeamName] = useState('');
  const [existsError, setExistsError] = useState(false);

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
      const newTeamName = await axios.post('/api/teams/create', {
        teamName: teamName,
        creatorUsername: githubUsername,
      });
      if (newTeamName) {
        goBackToDashboard();
      }
    } catch (error) {
      setExistsError(true);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="create__team__root">
        <div>
          <Button onClick={goBackToDashboard}>
            <ArrowBackIosIcon />
            Back to dashboard
          </Button>
          <h1>Please enter your new team's name:</h1>
          <p>Accomplish more with your team using trackr ©.</p>
          {existsError && (
            <p className="error__message">Team name already exists</p>
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
              Create Team
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamForm;
