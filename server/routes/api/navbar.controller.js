const express = require('express');
const axios = require('axios');
const searchRouter = express.Router();
var AWS = require('aws-sdk');

  const dynamoDB = new AWS.DynamoDB.DocumentClient();
  
//returns a list of all team names with the given search term 

const getAllMatchingCurrentTeams = async (searchQuery)=> {
    let teamMap = new Map();
    var teamParams = {
        TableName: 'Teams',
        ProjectionExpression:"teamName, members",
        ConsistentRead:'true',
        KeyConditionExpression: 'teamName= :searchQuery',
        ExpressionAttributeValues : {
            ':searchQuery':searchQuery
        }
    };
    dynamoDB.query(teamParams, function(err, teamData){
        if(err){
            console.log("Querying error for team data", err);
        } else {
            /*
            teamData.Items.forEach(function(item) {
                teamMap[item.teamName] = item.members;
            });
            */
           return teamData;
        }
    });

}

//get the array of usernames that match the search query 
const getAllMatchingCurrentUsers = async (searchQuery) => {
    let userList = [];
    var userParams = {
        TableName: 'Users',
        ProjectionExpression: "githubUsername",
        ConsistentRead: 'true',
        KeyConditionExpression: 'gitHubUsername=:searchQuery',
        ExpressionAttributeValues: {
            ":searchQuery": {'S':searchQuery}
        }
    }

    dynamoDB.query(userParams,function(err, UserData) {
        if(err) {
            console.log("Unable to query Trackr users:", JSON.stringify(err,null,2));

        } else {
            console.log("loading team results");
            data.Items.forEach(function(item){
                /*//push team name to overall list
                console.log(item.githubUsername);
                userList.push(item.githubUsername);
                */
               return UserData
            });
        }
    });

}

//get the array of project names that match the search query
const getAllMatchingProjects = async (searchQuery) => {
    let projectList = new Map();
    var projectParams = {
        TableName: 'Projects',
        ProjectionExpression: 'projectName, projectID',
        KeyConditionExpression: 'projectName=:searchQuery',
        ExpressionAttributeValues: {
            ":searchQuery": {'S': searchQuery}
        }
    }

    dynamoDB.query(projectParams,function(err,ProjectData) {
        if(err) {
            console.log("Unable to query Trackr users:", JSON.stringify(err,null,2));

        }
        else {
            console.log("loading project results");
            /*
            data.Items.forEach(function(item){
                projectList[item.projectID] = [item.projectName];
            });
            */
           return ProjectData;
        }
    });

}

const isEmpty = (object) => {
    return Object.keys(object).length === 0;
  };
  
/**
 * get matching team information
 */
searchRouter.get('/searchResults/matching-teams/:searchQuery',async(req, res)=> {
    const{searchQuery} = req.params;

    const teamMap = await getAllMatchingCurrentTeams(searchQuery);
    if(isEmpty(teamMap)) {
        res.json(404).json({message:'No teams available for that query'});
    }
    else {
        teamData.Items.forEach(function(item) {
           res.status(200).json({teamName: item.teamName, members: item.members});
        });
    }
});
/**
 * Get all matching user information
 */

searchRouter.get('/searchResults/matching-users/:searchQuery', async(req,res)=> {
    const{searchQuery} = req.params;

    const userList = await getAllMatchingCurrentUsers(searchQuery);
    if(isEmpty(userList)) {
        res.json({message:'No teams available for that query'});
    }
    else {
        userList.Items.forEach(function(item) {
            res.status(200).json({userName: item.gitHubUsername})
        });
    }
})
/**
 * Get all matching projects
 */

searchRouter.get('/searchResults/matching-projects/:searchQuery', async(req,res) =>{
    const{searchQuery} = req.params;
    
    const ProjectList = await getAllMatchingProjects(searchQuery);
    if(isEmpty(userList)) {
        res.json(404).json({message: 'No matching projects with this name'});
    }
    else {
        ProjectList.Items.forEach(function(item) {
            res.status(200).json({projectName: item.projectName, projectID:item.projectID});
        })
    }
})

module.exports = searchRouter;


