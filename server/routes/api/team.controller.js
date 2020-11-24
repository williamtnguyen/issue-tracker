const express = require('express');
const teamsRouter = express.Router();
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Checks if a teamName exists in the Teams table
const doesTeamExistInDB = async (teamName) => {
  const params = {
    TableName: 'Teams',
    Key: { teamName },
  };

  const lookup = await dynamoDB.get(params).promise();
  return lookup.Item !== undefined && lookup.Item !== null ? true : false;
};

// Checks if a githubUsername exists in the Users table
const doesUserExistInDB = async (githubUsername) => {
  const params = {
    TableName: 'Users',
    Key: { githubUsername },
  };

  const lookup = await dynamoDB.get(params).promise();
  return lookup.Item !== undefined && lookup.Item !== null ? true : false;
};

// Creates a new team with teamName in the Teams table
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
      'SET teams = list_append(if_not_exists(teams, :empty_list), :new_team)',
    ExpressionAttributeValues: {
      ':empty_list': [],
      ':new_team': [teamName],
    },
  };

  const createTeamResult = await dynamoDB.put(teamParams).promise();
  const updateUserResult = await dynamoDB.update(userParams).promise();
  return { createTeamResult, updateUserResult };
};

// Joins a member with joiningUsername to teamName in the Teams table
const joinMemberToTeamInDB = async (teamName, joiningUsername) => {
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
      'SET teams = list_append(if_not_exists(teams, :empty_list), :new_team)',
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

// Adds a member with addingUsername to teamName in the Teams table
const addMemberToTeamInDB = async (teamName, addingUsername) => {
  const doesUserExist = await doesUserExistInDB(addingUsername);

  const teamParams = {
    TableName: 'Teams',
    Key: { teamName },
    ReturnValues: 'ALL_NEW',
    UpdateExpression:
      'SET members = list_append(if_not_exists(members, :empty_list), :new_member)',
    ExpressionAttributeValues: {
      ':empty_list': [],
      ':new_member': [addingUsername],
    },
  };
  const newTeam = await dynamoDB.update(teamParams).promise();
  let newMember;

  // If user exists, just append teamName to current list of teams
  if (doesUserExist) {
    const updateUserParams = {
      TableName: 'Users',
      Key: { githubUsername: addingUsername },
      ReturnValues: 'ALL_NEW',
      UpdateExpression:
        'SET teams = list_append(if_not_exists(teams, :empty_list), :new_team)',
      ExpressionAttributeValues: {
        ':empty_list': [],
        ':new_team': [teamName],
      },
    };
    newMember = await dynamoDB.update(updateUserParams).promise();
    console.log(newTeam, newMember);
    return { newTeam, newMember };
  }
  // If user !exists, create a new user entry in DB with teamName as their only current team
  else {
    const createUserParams = {
      TableName: 'Users',
      Item: {
        githubUsername: addingUsername,
        teams: [teamName],
      },
      ReturnValues: 'ALL_OLD',
    };
    newMember = await dynamoDB.put(createUserParams).promise();
    console.log(newTeam, newMember);
    return { newTeam, newMember };
  }
};

// Fetches information about an entry in Teams table with teamName
const getTeamInformation = async (teamName) => {
  const params = {
    TableName: 'Teams',
    Key: { teamName },
  };

  const teamInfo = await dynamoDB.get(params).promise();
  return teamInfo.Item;
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
 * Joins a member to a team (user joins by entering team name)
 */
teamsRouter.post('/join', async (req, res) => {
  const { teamName, joiningUsername } = req.body;

  const doesExist = await doesTeamExistInDB(teamName);
  if (doesExist) {
    const joinResult = await joinMemberToTeamInDB(teamName, joiningUsername);
    if (!isEmpty(joinResult.newTeam) && !isEmpty(joinResult.newMember)) {
      res.status(200).json({ teamName });
    }
  } else {
    res.status(400).json({ message: 'Team name does not exist' });
  }
});

/**
 * Gets information about a team
 */
teamsRouter.get('/:teamName', async (req, res) => {
  const { teamName } = req.params;

  if (!teamName) {
    res.status(404).json({ message: 'Team name was not sent' });
  }

  const doesExist = await doesTeamExistInDB(teamName);
  if (doesExist) {
    const teamInfo = await getTeamInformation(teamName);
    res
      .status(200)
      .json({ teamName: teamInfo.teamName, members: teamInfo.members });
  } else {
    res.status(400).json({ message: 'Team name does not exist' });
  }
});

/**
 * Adds a member to a team (existing member adds a new user)
 */
teamsRouter.post('/add-member', async (req, res) => {
  const { teamName, addingUsername } = req.body;

  const doesTeamExist = await doesTeamExistInDB(teamName);

  if (doesTeamExist) {
    const addResult = await addMemberToTeamInDB(teamName, addingUsername);
    if (!isEmpty(addResult.newTeam) && !isEmpty(addResult.newMember)) {
      console.log(`Existing member added to team ${teamName}`);
    } else {
      console.log(`New member created and joined to team ${teamName}`);
    }
    res.status(200).json(addResult);
  } else {
    res.status(400).json({ message: 'Team name does not exist' });
  }
});

module.exports = teamsRouter;
