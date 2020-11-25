const axios = require('axios');
const express = require('express');
const taskRouter = express.Router();
const fs = require('fs');
const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Creates a new issue on github
const createIssueOnGit = async (req, accessToken) => {
    const payload = {
        title: req.body.title, 
        body: req.body.description
    };
    // const authHeaders = {
    //     headers: {
    //         "Content-Type": "application/json",
    //         Authorization: `Token ${accessToken}`,
    //     }
    // };
    try {
        const apiResponse = await axios.post(
            `http://api.github.com/repos/${req.body.owner}/${req.body.repo}/issues`, {
                body: payload
            }
        );
        console.log(apiResponse);
        console.log(apiResponse.status);
        return apiResponse.data;
    }
    catch(error) {
        return error.response.sendStatus;
    }
};

const getRepoCreator = () => {
    
};

// Adds a new task to dynamoDB
const createTaskOnDB = async (req, issueId) => {
    const {
        projectName,
        title, 
        assignees, 
        reporters, 
        priority, 
        description, 
        attachments, 
        dueDate 
    } = req.body;

    const getCreatorResult = await getRepoCreator();
    const addToProjectResult = await addTaskToProject(projectName, issueId);
    const addUserTasksResult = assignees.length > 0 && await addUserTasks(assignees, issueId);
    return {
        getCreatorResult,
        addToProjectResult,
        addUserTasksResult
    };
};

const addTaskToProject = async (projectName, issueId) => {
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

const addUserTasks = (githubUsernames, issueId) => {
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
    try {
        // const githubResult = await createIssueOnGit(req, req.cookies.accessToken);
        // const dynamoResult = await createTaskOnDB(req, githubResult.id);
        const dynamoResult = await createTaskOnDB(req, 1);
        // res.status(200).json({ id: githubResult.id });
        res.status(200).json({ message: 'works!' });
    } catch (error) {
        res.status(400).json({ message: 'Unable to create an issue' })
    }

});


module.exports = taskRouter;
