const express = require('express');
const axios = require('axios');

const usersRouter = express.Router();
const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/* Uses accessToken to retrieve basic information about a user */
const getGithubUserInfo = async (accessToken) => {
  const authHeaders = {
    headers: {
      Authorization: `bearer ${accessToken}`,
    },
  };

  const apiResponse = await axios.get(
    'https://api.github.com/user',
    authHeaders,
  );

  return apiResponse.data;
};

/**
 * Fetches information about a user from Github API and DynamoDB
 */
usersRouter.get('/:githubUsername', async (req, res) => {
  const { cookies } = req;
  const { githubUsername } = req.params;

  if (!cookies.accessToken) {
    res.status(404).json({ message: 'Access token was not sent in cookie' });
  }

  if (!githubUsername) {
    res.status(404).json({ message: 'Github username was not sent' });
  }

  const githubApiInfo = await getGithubUserInfo(cookies.accessToken);
  const params = {
    TableName: 'Users',
    Key: { githubUsername },
  };
  const dynamoDbInfo = await dynamoDB.get(params).promise();

  const response = {
    avatarSourceURL: githubApiInfo.avatar_url,
    followerCount: githubApiInfo.followers,
    followingCount: githubApiInfo.following,
    repoCount: githubApiInfo.public_repos,
    teams: dynamoDbInfo.Item.teams,
  };

  res.status(200).json(response);
});

module.exports = usersRouter;
