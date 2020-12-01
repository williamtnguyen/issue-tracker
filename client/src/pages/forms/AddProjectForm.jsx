import React, { useEffect, useContext, useState } from 'react';
import { UserContext } from '../../App';
import axios from 'axios';

import { TextField, Button } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Navbar from '../../components/material-ui/Navbar';
import './AddProjectForm.scss';

const AddProjectForm = (props) => {
  const { isAuthenticated, githubUsername } = useContext(UserContext);
  const { history } = props;
  const [teamName, setTeamName] = useState('');
  const [projectUrl, setProjectUrl] = useState('');

  const [inputError, setInputError] = useState(false);
  const [inputErrorText, setInputErrorText] = useState('');
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

    // Client side input validation
    let trimmedUrl = projectUrl;
    if (trimmedUrl.charAt(trimmedUrl.length - 1) === '/') {
      trimmedUrl = trimmedUrl.substring(0, trimmedUrl.length - 1);
    }
    const splitUrl = trimmedUrl.split('/');

    if (
      (splitUrl[0] === 'https:' && splitUrl.length !== 5)
      || (splitUrl[0].includes('github.com') && splitUrl.length !== 3)
    ) {
      setInputError(true);
      setInputErrorText('URL format is incorrect');
    } else if (splitUrl[splitUrl.length - 2] !== githubUsername) {
      setInputError(true);
      setInputErrorText('Only repository owners can submit their projects');
    } else {
      setInputError(false);
      const creatorUsername = splitUrl[splitUrl.length - 2];
      const projectName = splitUrl[splitUrl.length - 1];

      try {
        const newProject = await axios.post('/api/projects/create', {
          teamName,
          creatorUsername,
          projectName,
        });
        if (newProject) {
          goBackToTeamPage();
        }
      } catch (error) {
        setNotExistsError(true);
      }
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
          <h1>Please enter Github repository URL:</h1>
          <p>
            Example: https://github.com/foo/
            <span style={{ color: 'green' }}>trackr</span>
          </p>
          {inputError && <p className="error__message">{inputErrorText}</p>}
          {notExistsError && (
            <p className="error__message">
              Repository does not exist or repository owner is not in team
            </p>
          )}
          <form onSubmit={handleSubmit} noValidate autoComplete="off">
            <TextField
              onChange={(event) => setProjectUrl(event.target.value)}
              id="outlined-secondary"
              label="Github repository URL..."
              variant="outlined"
              color="secondary"
              fullWidth
              style={{ marginBottom: '30px' }}
            />
            <Button variant="contained" color="secondary" type="submit">
              Add Project
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProjectForm;
