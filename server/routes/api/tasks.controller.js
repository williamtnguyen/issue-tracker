const axios = require('axios');
const express = require('express');
const taskRouter = express.Router();
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Creates a new issue on github
const createIssueOnGit = async (req) => {
  const {
    title,
    assignees,
    description,
    owner,
    projectName,
  } = req.body;

  const requestBody = {
    title: title,
    body: description,
    assignees: assignees,
  };
  const authHeaders = {
    headers: {
      Authorization: `token ${req.cookies.accessToken}`,
    },
  };

  const apiResponse = await axios.post(
    `https://api.github.com/repos/123/${projectName}/issues`,
    requestBody,
    authHeaders
  );

  return apiResponse.data;
};

// Adds a new task to dynamoDB
const createTaskOnDB = async (reqBody, githubId, creationTime) => {
  const task = {
    taskId: githubId,
    title: reqBody.title,
    assignees: reqBody.assignees,
    reporters: reqBody.reporters,
    priority: reqBody.priority,
    status: reqBody.status,
    description: reqBody.description,
    dueDate: reqBody.dueDate,
    creationTimeStamp: creationTime,
  };

  const addToTasksResult = await addToTasks(task);
  const addToProjectsResult = await addToProjects(reqBody.projectName, task);
  const addUserTasksResult =
    reqBody.assignees.length > 0 && (await addUserTasks(task));
  return { addToTasksResult, addToProjectsResult, addUserTasksResult };
};

const addToTasks = async (task) => {
  const taskParams = {
    TableName: 'Tasks',
    Item: task,
    ReturnValues: 'ALL_OLD',
  };

  const createTaskResult = await dynamoDB.put(taskParams).promise();
  return createTaskResult;
};

const addToProjects = async (projectName, task) => {
  const projectParams = {
    TableName: 'Projects',
    Key: { projectName },
    ReturnValues: 'ALL_NEW',
    UpdateExpression: 'SET issues.#taskId = :newTask',
    ExpressionAttributeNames: {
      '#taskId': task.taskId,
    },
    ExpressionAttributeValues: {
      ':newTask': task,
    },
    ConditionExpression: 'attribute_not_exists(issues.#taskId)',
  };

  const addToProjectResult = await dynamoDB.update(projectParams).promise();
  return addToProjectResult;
};

const addUserTasks = async (task) => {
  const results = {
    assignees: [],
    reporters: [],
  };

  // Adds taskId to each assigned user
  for (const githubUsername of task.assignees) {
    const usersParams = {
      TableName: 'Users',
      Key: { githubUsername },
      ReturnValues: 'ALL_NEW',
      UpdateExpression:
        'SET assignedTasks = list_append(if_not_exists(assignedTasks, :empty_list), :taskId)',
      ExpressionAttributeValues: {
        ':empty_list': [],
        ':taskId': [task.taskId],
      },
    };

    const currAssignee = await dynamoDB.update(usersParams).promise();
    results.assignees.push(currAssignee);
  }

  // Adds taskId to each reported user
  for (const githubUsername of task.reporters) {
    const usersParams = {
      TableName: 'Users',
      Key: { githubUsername },
      ReturnValues: 'ALL_NEW',
      UpdateExpression:
        'SET reportedTasks = list_append(if_not_exists(reportedTasks, :empty_list), :taskId)',
      ExpressionAttributeValues: {
        ':empty_list': [],
        ':taskId': [task.taskId],
      },
    };

    const currReporter = await dynamoDB.update(usersParams).promise();
    results.reporters.push(currReporter);
  }

  return results;
};

// Gets all tasks associated with a project
const getTasksInProject = async (projectName) => {
  const params = {
    TableName: 'Projects',
    Key: { projectName },
  };

  const projectInfo = await dynamoDB.get(params).promise();
  return projectInfo.Item.issues ? projectInfo.Item.issues : {};
};

// Updates the status of a task with taskId in project with projectName
const updateTaskStatus = async (projectName, taskId, newStatus) => {
  const taskParams = {
    TableName: 'Tasks',
    Key: { taskId },
    ReturnValues: 'ALL_NEW',
    UpdateExpression: 'SET #status = :status',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': newStatus,
    },
  };
  const projectParams = {
    TableName: 'Projects',
    Key: { projectName },
    ReturnValues: 'ALL_NEW',
    UpdateExpression: 'SET issues.#taskId.#status = :newStatus',
    ExpressionAttributeNames: {
      '#taskId': taskId,
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':newStatus': newStatus,
    },
  };

  const updateTaskResult = await dynamoDB.update(taskParams).promise();
  const updateProjectResult = await dynamoDB.update(projectParams).promise();
  return { updateTaskResult, updateProjectResult };
};

const isEmpty = (object) => {
  return Object.keys(object).length === 0;
};

/**
 * Creates a task
 */
taskRouter.post('/create', async (req, res) => {
  try {
    const githubResult = await createIssueOnGit(req);
    const dynamoResult = await createTaskOnDB(
      req.body,
      githubResult.id,
      githubResult.created_at
    );
    if (
      isEmpty(dynamoResult.addToTasksResult) &&
      !isEmpty(dynamoResult.addToProjectsResult) &&
      !isEmpty(dynamoResult.addUserTasksResult)
    ) {
      res.status(200).json(dynamoResult);
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

/**
 * Gets all tasks associated with a project
 */
taskRouter.get('/:projectName', async (req, res) => {
  const { projectName } = req.params;

  if (!projectName) {
    res.status(404).json({ message: 'Project name was not sent' });
  }

  try {
    const taskInformation = await getTasksInProject(projectName);
    if (taskInformation) {
      res.status(200).json({ tasks: taskInformation });
    }
  } catch (error) {
    res.status(400).json({ message: 'Cannot get tasks for project' });
  }
});

/**
 * Changes the status of a task as a result of a 'dragEnd' event on frontend
 */
taskRouter.post('/update-status', async (req, res) => {
  const { projectName, taskId, newStatus } = req.body;

  if (!projectName || !taskId) {
    res.status(400).json({ message: 'Project name or task ID not sent' });
  }

  try {
    const updateTaskResult = await updateTaskStatus(
      projectName,
      taskId,
      newStatus
    );
    if (
      !isEmpty(updateTaskResult.updateTaskResult) &&
      !isEmpty(updateTaskResult.updateProjectResult)
    ) {
      res.status(200).json(updateTaskResult);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = taskRouter;
