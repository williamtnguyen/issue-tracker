import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../App';
import axios from 'axios';
import { Button, CircularProgress } from '@material-ui/core';
// import illustration from '../assets/landing-page-illustration.png';
import './Landing.scss';

const Landing = (props) => {
  // Whether or not user has authorized our application to use their information
  const [hasAuthorized, setHasAuthorized] = useState(false);
  // Whether or not the use has successfully authenticated (state to be used globally)
  const { isAuthenticated, setIsAuthenticated, setGithubUsername } = useContext(
    UserContext
  );

  useEffect(() => {
    if (isAuthenticated) {
      window.location.pathname = '/dashboard';
    } else {
      const { search } = window.location;
      if (search !== '') {
        setHasAuthorized(true);
        const params = new URLSearchParams(search);
        const authCode = params.get('code');

        fetchAndSetUserInfo(authCode);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAndSetUserInfo = async (authCode) => {
    // Gets information about the user & sets an HTTPOnly Cookie in 
    // browser for all subsequent requests
    const githubUserInfo = await axios.post('/api/auth/access-token', {
      authCode,
    });

    // Set global state and put something in local storage to persist user sessions
    setIsAuthenticated(true);
    setGithubUsername(githubUserInfo.data.login);
    localStorage.setItem('githubUsername', githubUserInfo.data.login);

    props.history.push('/dashboard');
  };

  return (
    <div className="center__content">
      {!hasAuthorized ? (
        <section className="center__content">
          <h1>trackr ©</h1>
          <p>
            The best issue tracking application. Fully synchronized with Github.
          </p>
          <Button
            variant="contained"
            color="secondary"
            href="https://github.com/login/oauth/authorize?client_id=4890cae2dd24c037cfe7&scope=repo%20public_repo%20repo:status"
          >
            Sign in with Github
          </Button>
        </section>
      ) : (
        <section className="center__content">
          <h1>redirecting to dashboard...</h1>
          <CircularProgress color="secondary" />
        </section>
      )}
    </div>
  );
};

export default Landing;
