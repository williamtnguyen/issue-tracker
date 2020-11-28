const express = require('express');
const axios = require('axios');
const projectsRouter = express.Router();
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TaskProgressEnum = require('../../utils/enums/tasks');

// Checks if githubUsername is in teamName 'members' in DynamoDB
const isUserInTeam = async (githubUsername, teamName) => {
  const params = {
    TableName: 'Teams',
    Key: { teamName },
  };

  const teamInfo = await dynamoDB.get(params).promise();
  return teamInfo.Item.members.includes(githubUsername);
};

/* Returns a promise that either resolves the required repo info, else rejects an error object */
const getRepositoryInfo = async (githubUsername, projectName) => {
  return new Promise(async (resolve, reject) => {
    // Get all repos under githubUsername from Github API
    const githubRepos = await axios.get(
      `https://api.github.com/users/${githubUsername}/repos?sort=created`
    );

    // Filter for the repo with projectName
    const repositoryInfo = githubRepos.data.filter(
      (repoObject) => repoObject.name === projectName
    );

    // Assign repositoryId/repositoryName pointers if filter was successful, else reject with an error message
    let repositoryId;
    let repositoryName;
    if (repositoryInfo.length !== 0) {
      repositoryId = repositoryInfo[0].id;
      repositoryName = repositoryInfo[0].name;
    } else {
      reject({
        message:
          'Project name does not exist as a repository under associated Github username',
      });
    }

    // Get all issues under projectName from Github API
    const githubIssues = await axios.get(
      `https://api.github.com/repos/${githubUsername}/${projectName}/issues`
    );

    // Reduce the API response to an array of only needed info
    const repositoryIssues = githubIssues.data.map((issueObject) => {
      return {
        id: issueObject.id,
        title: issueObject.title,
        description: issueObject.body,
        status: TaskProgressEnum.TO_DO,
        reporters: issueObject.user.login,
        assignees: issueObject.assignees.map(
          (assigneeObject) => assigneeObject.login
        ),
      };
    });

    resolve({
      repositoryId,
      repositoryName,
      repositoryIssues,
    });
  });
};

// Checks if a projectName exists in the Projects table
const doesProjectExistInDB = async (projectName) => {
  const params = {
    TableName: 'Projects',
    Key: { projectName },
  };

  const lookup = await dynamoDB.get(params).promise();
  return lookup.Item !== undefined && lookup.Item !== null ? true : false;
};

// Creates a new project in DB with projectName/projectId in the Projects table
const createProjectInDB = async (repositoryInfo, teamName) => {
  const { repositoryId, repositoryName, repositoryIssues } = repositoryInfo;

  const projectParams = {
    TableName: 'Projects',
    Item: {
      projectName: repositoryName,
      projectId: repositoryId,
    },
    ReturnValues: 'ALL_OLD',
  };

  const teamParams = {
    TableName: 'Teams',
    Key: { teamName },
    ReturnValues: 'ALL_NEW',
    UpdateExpression:
      'SET projects = list_append(if_not_exists(projects, :empty_list), :new_project)',
    ExpressionAttributeValues: {
      ':empty_list': [],
      ':new_project': [repositoryName],
    },
  };

  const createTaskResults = [];
  if (repositoryIssues.length !== 0) {
    projectParams.Item.issues = repositoryIssues;

    // Writing to Tasks table in DB
    for (const issueObject of repositoryIssues) {
      const taskParams = {
        TableName: 'Tasks',
        Item: {
          taskId: issueObject.id,
          title: issueObject.title,
          description: issueObject.description,
          status: issueObject.status,
          reporters: issueObject.reporters,
          assignees: issueObject.assignees,
        },
        ReturnValues: 'ALL_OLD',
      };

      const createTaskResult = await dynamoDB.put(taskParams).promise();
      createTaskResults.push(createTaskResult);
    }
  }

  const createProjectResult = await dynamoDB.put(projectParams).promise();
  const updateTeamResult = await dynamoDB.update(teamParams).promise();
  return { createProjectResult, updateTeamResult, createTaskResults };
};

// Fetches information about an entry in Projects table with projectName
const getProjectInformation = async (projectName) => {
  const params = {
    TableName: 'Projects',
    Key: { projectName },
  };

  const projectInfo = await dynamoDB.get(params).promise();
  return projectInfo.Item;
};

const isEmpty = (object) => {
  return Object.keys(object).length === 0;
};

/**
 * Creates a project entry in Projects table in DB using info from Github API
 *
 * Checks:
 * • If creatorUsername is in team with teamName in DB
 * • If the repository exists and is public under creatorUsername via Github API
 * Then:
 * • Creates an entry in DB about the current project (id, name, issues[])
 */
projectsRouter.post('/create', async (req, res) => {
  const { cookies } = req;
  const { teamName, creatorUsername, projectName } = req.body;

  const isTeamMember = await isUserInTeam(creatorUsername, teamName);
  if (!isTeamMember) {
    res.status(400).json({
      message:
        'User entering project URL is not in current team, some malicious activity may be happening.',
    });
  }

  try {
    const repositoryInfo = await getRepositoryInfo(
      creatorUsername,
      projectName
    );
    const doesProjectExist = await doesProjectExistInDB(projectName);

    if (doesProjectExist) {
      res.status(400).json({ message: 'Project name already exists' });
    } else {
      const createResult = await createProjectInDB(repositoryInfo, teamName);
      if (
        isEmpty(createResult.createProjectResult) &&
        !isEmpty(createResult.updateTeamResult)
      ) {
        res.status(200).json({ teamName, creatorUsername, projectName });
      }
    }
  } catch (error) {
    // Throw error when repository name doesn't exist under creatorUsername
    res.status(400).json(error);
  }
});

/**
 * Gets necessary information for a respective project
 */
projectsRouter.get('/:projectName', async (req, res) => {
  const { projectName } = req.params;

  if (!projectName) {
    res.status(404).json({ message: 'Project name was not sent' });
  }

  const doesProjectExist = await doesProjectExistInDB(projectName);
  if (doesProjectExist) {
    const projectInfo = await getProjectInformation(projectName);
    res.status(200).json({
      projectName: projectInfo.projectName,
      issues: projectInfo.issues,
    });
  } else {
    res.status(400).json({ message: 'Project name does not exist' });
  }
});

module.exports = projectsRouter;
