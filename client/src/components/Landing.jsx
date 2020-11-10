import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, CircularProgress } from '@material-ui/core';
import './Landing.scss';

const Landing = (props) => {
  const [hasAuthorized, setHasAuthorized] = useState(false);

  useEffect(() => {
    const { search } = window.location;
    if (search !== '') {
      setHasAuthorized(true);
      const params = new URLSearchParams(search);
      const authCode = params.get('code');

      fetchAndSetUserInfo(authCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAndSetUserInfo = async (authCode) => {
    const githubUserInfo = await axios.post('/api/users', {
      authCode: authCode,
    });

    // Redirect here as a side effect because asynchronosity is whacky if we try to make functions pure
    props.history.push({
      pathname: '/dashboard',
      state: { username: githubUserInfo.data.login },
    });
  };

  return (
    <div className="landing__root">
      {!hasAuthorized ? (
        <section className="landing__root">
          <h1>trackr ©</h1>
          <p>
            The best issue tracking application. Fully synchronized with Github.
          </p>
          <Button
            variant="contained"
            color="secondary"
            href="https://github.com/login/oauth/authorize?client_id=Iv1.ab6ee8ba954385ee&redirect_uri=http://localhost:3000/login"
          >
            Sign in with Github
          </Button>
        </section>
      ) : (
        <section className="landing__root">
          <h1>redirecting to dashboard...</h1>
          <CircularProgress color="secondary" />
        </section>
      )}
    </div>
  );
};

export default Landing;
