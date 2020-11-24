const axios = require('axios');
const express = require('express');
const taskRouter = express.Router();
const fs = require('fs');
const AWS = require('aws-sdk');
const S3 = new AWS.S3();

// Creates a new issue on github
const createIssueOnGit = async (req) => {
    const requestBody = {
        owner: req.owner, 
        repo: req.repo, 
        title: req.title, 
        assignees: req.assignees, // array of strings
        body: req.description
    };
    // const requestBody = {
    //     owner: req.creatorId, 
    //     repo: req.projectId, 
    //     title: req.title, 
    //     assignees: req.assignees, // array of strings
    //     body: req.description
    // };

    try {
        const apiResponse = await axios.post(
            `https://api.github.com/repos/${req.owner}/${req.repo}/issues`, 
            requestBody
        );
        console.log(apiResponse);
        return apiResponse.status;
    }
    catch(error) {
        return error.response.sendStatus;
    }
};

// Adds a new task to dynamoDB
const createTaskOnDB = async (req, issueId) => {
    const {
        creatorId, 
        projectId,
        title, 
        assignees, 
        reporters, 
        priority, 
        description, 
        attachments, 
        dueDate 
    } = req.body;
    const taskParams = {
        TableName: 'Tasks',
        Key: { taskId: issueId },
        UpdateExpression:
        'set ',
        ReturnValues: 'UPDATED_NEW'
    };

    const projectResult = await addTaskToProject(projectId, issueId);
};

const addTaskToProject = async (projectId, issueId) => {

}

taskRouter.post('/create', async (req, res) => {
    console.log(req);

    try {
        const githubResult = await createIssueOnGit(req);
        // const dynamoResult = await createTaskOnDB(req, githubResult.id);
        // res.status(200).json({ id: githubResult.id });
        res.status(200).json({ message: 'works!' });
    } catch (error) {
        res.status(400).json({ message: 'Unable to create an issue' })
    }

});


module.exports = taskRouter;
