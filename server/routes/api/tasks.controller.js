const axios = require('axios');
const express = require('express');
const taskRouter = express.Router();
const fs = require('fs');
const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Creates a new issue on github
const createIssueOnGit = async (req) => {
    const { 
        title, 
        description,
        owner,
        repoName
    } = req.body;

    const requestBody = {
        title: title, 
        body: description
    };
    const authHeaders = {
        headers: {
            Authorization: `token c3cf6ec1c1adf3a70e18c9c6ef951d22ced0f05e`
        }
    };

    // Problem with token scopes
    console.log(req.cookies.accessToken);
    console.log(`https://api.github.com/repos/${owner}/${repoName}/issues`);

    const apiResponse = await axios.post(
        `https://api.github.com/repos/${owner}/${repoName}/issues`, 
        requestBody,
        authHeaders
    );

    console.log(apiResponse.status);
    console.log(apiResponse.data);
    return apiResponse.data;
};


// Adds a new task to dynamoDB
const createTaskOnDB = async (reqBody, githubIssue) => {
    const task = {
        ...reqBody,
        taskId: githubIssue.id,
        creationTimeStamp: githubIssue.created_at,
        updatedTimeStamp: githubIssue.updated_at
    };

    const addToTasksResult = await addToTasks(task);
    const addToProjectsResult = await addToProjects(reqBody.projectName, );
    const addUserTasksResult = assignees.length > 0 && await addUserTasks(assignees, issueId);
    return { addToTasksResult, addToProjectResult, addUserTasksResult };
};

const addToTasks = async (task) => {
    const taskParams = {
        TableName: 'Tasks',
        Item: task,
        ReturnValues: 'ALL_OLD'
    };

    const createTaskResult = await dynamoDB.put(taskParams).promise();
    return createTaskResult;
};

// Take from project.controller
const addToProjects = async (projectName, issueInfo) => {
    const taskParams = {
        TableName: 'Tasks',
        Key: { taskId: issueId },
        ReturnValues: 'ALL_NEW',
        UpdateExpression:
        'SET tasks = list_append(if_not_exists(tasks, :empty_list), :new_task',
    };
    const projectParams = {

    };

    const addTaskResult = await dynamoDB.put(taskParams).promise();
    const addToProjectTasksResult = await dynamoDB.update(projectParams).promise();
    return addTaskResult;
}

const addUserTasks = async (githubUsernames, issueId) => {
    const taskParams = {
        TableName: 'Tasks',
        Key: { taskId: issueId },
        ReturnValues: 'ALL_NEW',
        UpdateExpression:
        'SET tasks = list_append(if_not_exists(tasks, :empty_list), :new_task',
    };

    const addTaskResult = await dynamoDB.put(taskParams).promise();
    return addTaskResult;
};

taskRouter.post('/create', async (req, res) => {
    // const githubResult = await createIssueOnGit(req);
    const dynamoResult = await createTaskOnDB(req.body, githubResult.data);
    res.status(200);
});


module.exports = taskRouter;
