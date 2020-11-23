import React, { useEffect, useContext, useState } from 'react';
import { UserContext } from '../../App';
import axios from 'axios';

import { TextField, Button } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Navbar from '../../components/material-ui/Navbar';
import './AddMemberForm.scss';

const AddMemberForm = (props) => {
  const { isAuthenticated } = useContext(UserContext);
  const { history } = props;
  const [teamName, setTeamName] = useState('');
  const [addingUsername, setAddingUsername] = useState('');
  const [notExistsError, setNotExistsError] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      history.push('/login');
    }
    setTeamName(props.location.state.teamName);
  }, [history, isAuthenticated, props]);

  const goBackToTeamPage = () => {
    history.push({
      pathname: `/team/${teamName}`,
      state: { refreshFlag: true },
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const newTeamName = await axios.post('/api/teams/add-member', {
        teamName,
        addingUsername,
      });
      if (newTeamName) {
        goBackToTeamPage();
      }
    } catch (error) {
      setNotExistsError(true); // should never happen
    }
  };

  return (
    <div>
      <Navbar />
      <div className="add__team__root">
        <div>
          <Button onClick={goBackToTeamPage}>
            <ArrowBackIosIcon />
            Back to Team
          </Button>
          <h1>Please enter Github username of member:</h1>
          <p>Accomplish more with your team using trackr ©.</p>
          {notExistsError && (
            <p className="error__message">Team name does not exist</p>
          )}
          <form onSubmit={handleSubmit} noValidate autoComplete="off">
            <TextField
              onChange={(event) => setAddingUsername(event.target.value)}
              id="outlined-secondary"
              label="Github username..."
              variant="outlined"
              color="secondary"
              fullWidth={true}
              style={{ marginBottom: '30px' }}
            />
            <Button variant="contained" color="secondary" type="submit">
              Add Member
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMemberForm;
