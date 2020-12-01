const fs = require('fs');
const express = require('express');

const authRouter = express.Router();
const axios = require('axios');
const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/* Exchanges authorization code from OAuth for an access token */
const getAccessToken = async (authCode, clientId, clientSecret) => {
  const requestBody = {
    code: authCode,
    client_id: clientId,
    client_secret: clientSecret,
  };

  const apiResponse = await axios.post(
    'https://github.com/login/oauth/access_token',
    requestBody,
  );

  const params = new URLSearchParams(apiResponse.data);
  return params.get('access_token');
};

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

const doesUserExistInDB = async (githubUsername) => {
  const params = {
    TableName: 'Users',
    Key: { githubUsername },
  };

  const lookup = await dynamoDB.get(params).promise();
  return !!(lookup.Item !== undefined && lookup.Item !== null);
};

/**
 * If user already exists, returns information about existing item.
 * Otherwise creates the user and returns {}
*/
const createUserInDB = async (githubUsername, githubId) => {
  const params = {
    TableName: 'Users',
    Item: {
      githubUsername,
      githubId,
    },
    ReturnValues: 'ALL_OLD',
  };

  const putResult = await dynamoDB.put(params).promise();
  return putResult;
};

const isEmpty = (object) => Object.keys(object).length === 0;

/* Updates githubId of User row if it is null */
const updateGithubIdOnFirstLogin = async (githubUsername, githubId) => {
  const params = {
    TableName: 'Users',
    Key: { githubUsername },
    ReturnValues: 'ALL_NEW',
    UpdateExpression: 'SET githubId = if_not_exists(githubId, :githubId)',
    ExpressionAttributeValues: {
      ':githubId': githubId,
    },
  };

  const updateResult = await dynamoDB.update(params).promise();
  return updateResult;
};

/**
 * Exchanges authorization code for an access token & writes user info to DynamoDB
 */
authRouter.post('/access-token', async (req, res) => {
  const { authCode } = req.body;
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = JSON.parse(
    fs.readFileSync(`${__dirname}/../../config/secrets.json`),
  );

  const accessToken = await getAccessToken(
    authCode,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
  );

  const githubUserInfo = await getGithubUserInfo(accessToken);

  const doesExist = await doesUserExistInDB(githubUserInfo.login);
  if (!doesExist) {
    const putResult = await createUserInDB(
      githubUserInfo.login,
      githubUserInfo.id,
    );

    if (!isEmpty(putResult)) {
      await updateGithubIdOnFirstLogin(
        githubUserInfo.login,
        githubUserInfo.id,
      );
    }
  }

  // Send HTTPOnly cookie containing accessToken & authenticated user's username as response
  res
    .status(200)
    .cookie('accessToken', accessToken, {
      httpOnly: true,
    })
    .json(githubUserInfo);
});

module.exports = authRouter;
