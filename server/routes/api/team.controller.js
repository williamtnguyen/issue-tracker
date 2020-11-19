const express = require('express');
const teamsRouter = express.Router();
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const doesTeamExistInDB = async (teamName) => {
  const params = {
    TableName: 'Teams',
    Key: { teamName },
  };

  const lookup = await dynamoDB.get(params).promise();
  return lookup.Item !== undefined && lookup.Item !== null ? true : false;
};

const createTeamInDB = async (teamName, creatorUsername) => {
  const teamParams = {
    TableName: 'Teams',
    Item: {
      teamName: teamName,
      members: [creatorUsername],
    },
    ReturnValues: 'ALL_OLD',
  };
  const userParams = {
    TableName: 'Users',
    Key: { githubUsername: creatorUsername },
    ReturnValues: 'ALL_NEW',
    UpdateExpression:
      'set teams = list_append(if_not_exists(#teams, :empty_list), :new_team)',
    ExpressionAttributeNames: {
      '#teams': 'teams',
    },
    ExpressionAttributeValues: {
      ':empty_list': [],
      ':new_team': [teamName],
    },
  };

  const createTeamResult = await dynamoDB.put(teamParams).promise();
  const updateUserResult = await dynamoDB.update(userParams).promise();
  return { createTeamResult, updateUserResult };
};

const addMemberToTeamInDB = async (teamName, joiningUsername) => {
  const teamParams = {
    TableName: 'Teams',
    Key: { teamName },
    ReturnValues: 'ALL_NEW',
    UpdateExpression:
      'set members = list_append(if_not_exists(#members, :empty_list), :new_member)',
    ExpressionAttributeNames: {
      '#members': 'members',
    },
    ExpressionAttributeValues: {
      ':empty_list': [],
      ':new_member': [joiningUsername],
    },
  };
  const userParams = {
    TableName: 'Users',
    Key: { githubUsername: joiningUsername },
    ReturnValues: 'ALL_NEW',
    UpdateExpression:
      'set teams = list_append(if_not_exists(#teams, :empty_list), :new_team)',
    ExpressionAttributeNames: {
      '#teams': 'teams',
    },
    ExpressionAttributeValues: {
      ':empty_list': [],
      ':new_team': [teamName],
    },
  };

  const newTeam = await dynamoDB.update(teamParams).promise();
  const newMember = await dynamoDB.update(userParams).promise();
  console.log(newTeam, newMember);
  return { newTeam, newMember };
};

const isEmpty = (object) => {
  return Object.keys(object).length === 0;
};

/**
 * Creates a Team
 */
teamsRouter.post('/create', async (req, res) => {
  const { teamName, creatorUsername } = req.body;

  const doesExist = await doesTeamExistInDB(teamName);
  if (!doesExist) {
    const createResult = await createTeamInDB(teamName, creatorUsername);
    if (
      isEmpty(createResult.createTeamResult) &&
      !isEmpty(createResult.updateUserResult)
    ) {
      res.status(200).json({ teamName });
    }
  } else {
    res.status(400).json({ message: 'Team name already exists' });
  }
});

/**
 * Joins a member to a team
 */
teamsRouter.post('/join', async (req, res) => {
  const { teamName, joiningUsername } = req.body;

  const doesExist = await doesTeamExistInDB(teamName);
  if (doesExist) {
    const joinResult = await addMemberToTeamInDB(teamName, joiningUsername);
    if (!isEmpty(joinResult.newTeam) && !isEmpty(joinResult.newMember)) {
      res.status(200).json({ teamName });
    }
  } else {
    res.status(400).json({ message: 'Team name does not exist' });
  }
});

module.exports = teamsRouter;
