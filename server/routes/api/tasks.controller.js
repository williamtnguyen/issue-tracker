const axios = require('axios');
const express = require('express');
const taskRouter = express.Router();
const AWS = require('aws-sdk');
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
            Authorization: `token ${req.cookies.accessToken}`
        }
    };

    const apiResponse = await axios.post(
        `https://api.github.com/repos/${owner}/${repoName}/issues`, 
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
        creationTimeStamp: creationTime
    };

    const addToTasksResult = await addToTasks(task);
    const addToProjectsResult = await addToProjects(reqBody.projectName, task);
    const addUserTasksResult = reqBody.assignees.length > 0 && await addUserTasks(task);
    return { addToTasksResult, addToProjectsResult, addUserTasksResult };
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

const addToProjects = async (projectName, task) => {
    const projectParams = {
        TableName: 'Projects',
        Key: { projectName },
        ReturnValues: 'ALL_NEW',
        UpdateExpression:
        'SET issues = list_append(if_not_exists(issues, :empty_list), :new_task)',
        ExpressionAttributeValues: {
            ':empty_list': [],
            ':new_task': [task]
        }
    };

    const addToProjectResult = await dynamoDB.update(projectParams).promise();
    return addToProjectResult;
}

const addUserTasks = async (task) => {
    const results = {
        assignees: [],
        reporters: []
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
                ':taskId': [task.taskId]
            }
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
                ':taskId': [task.taskId]
            }
        };

        const currReporter = await dynamoDB.update(usersParams).promise();
        results.reporters.push(currReporter); 
    }

    return results;
};

const isEmpty = (object) => {
    return Object.keys(object).length === 0;
};

taskRouter.post('/create', async (req, res) => {
    try {
        const githubResult = await createIssueOnGit(req);
        const dynamoResult = await createTaskOnDB(req.body, githubResult.id, githubResult.created_at);
        if (isEmpty(dynamoResult.addToTasksResult) && 
            !isEmpty(dynamoResult.addToProjectsResult) &&
            !isEmpty(dynamoResult.addUserTasksResult)
        ) {
            res.status(200);
        }
    } catch (error) {
        res.status(400).json(error);
    }
});


module.exports = taskRouter;
