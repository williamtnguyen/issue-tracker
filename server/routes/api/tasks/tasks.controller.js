const axios = require('axios');
const express = require('express');
const taskRouter = express.Router();
const fs = require('fs');
const AWS = require('aws-sdk');
const S3 = new AWS.S3();

// Creates a new issue on github
const createIssue = async (req) => {
    const requestBody = {
        owner: req.creatorId, 
        repo: req.projectId, 
        title: req.title, 
        assignees: req.assignees, // array of strings
        body: req.description
    };

    try {
        const apiResponse = await axios.post(
            `https://api.github.com/repos/${requestBody.owner}/${requestBody.repo}/issues`, 
            requestBody
        );
        
        return apiResponse;
    }
    catch(error) {
        return error.response.sendStatus;
    }
};

// Adds a new issue 
const uploadNewIssue = async (req, issueId) => {
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

    
};

taskRouter.post('/create', async (req, res) => {
    console.log(req);

    const createIssueResp = await createIssue(req);
    await uploadNewIssue(req)

    res.sendStatus(createIssueResp);
});


module.exports = taskRouter;
