const fs = require('fs');
const express = require('express');
const authRouter = express.Router();
const axios = require('axios');

const getAccessToken = async (authCode, clientId, clientSecret) => {
  const requestBody = {
    code: authCode,
    client_id: clientId,
    client_secret: clientSecret,
  };

  const apiResponse = await axios.post(
    'https://github.com/login/oauth/access_token',
    requestBody
  );

  const params = new URLSearchParams(apiResponse.data);
  return params.get('access_token');
};

const getGithubUserInfo = async (accessToken) => {
  const authHeaders = {
    headers: {
      Authorization: `bearer ${accessToken}`,
    },
  };

  const apiResponse = await axios.get(
    'https://api.github.com/user',
    authHeaders
  );

  return apiResponse.data;
};

authRouter.post('/access-token', async (req, res) => {
  console.log(req.body);
  const { authCode } = req.body;
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = JSON.parse(
    fs.readFileSync(__dirname + '/../../../config/secrets.json')
  );

  const accessToken = await getAccessToken(
    authCode,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET
  );
  console.log('Access Token received', accessToken);

  const githubUserInfo = await getGithubUserInfo(accessToken);
  console.log(githubUserInfo);

  // Send HTTPOnly cookie containing accessToken & authenticated user's username as response
  res
    .status(200)
    .cookie('accessToken', accessToken, {
      httpOnly: true,
    })
    .json(githubUserInfo);
});

module.exports = authRouter;
