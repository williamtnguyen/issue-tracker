# issue-tracker

[![Build Status](https://travis-ci.com/williamtnguyen/issue-tracker.svg?branch=master)](https://travis-ci.com/williamtnguyen/issue-tracker)

This is a three-tier application that allows software teams to closely track tasks/issues. This application is essentially a JIRA clone that is fully synchronized with Github issues, offering additional features such as task status/priority and a rich UI.

## Course/Contributor Information

- University: San Jose State University
- Course: CMPE 172: Enterprise Software
- Students: [Gary Chang](https://github.com/1234momo), [Sachin Shah](https://github.com/sachinio20), [William Nguyen](https://github.com/williamtnguyen)

## Project Components

- UI is built with React, which uses [material-ui](https://github.com/mui-org/material-ui) and [react-beautiful-dnd](https://github.com/atlassian/react-beautiful-dnd) for a rich user experience
- Backend server is built with Express, which interacts with Github's REST API and AWS DynamoDB to read/write information based on client requests

### Cloud Services

- AWS DynamoDB for NoSQL data storage
- AWS EC2 to host our application

## Running the Project Locally

Clone the repository:

```
$ git clone https://github.com/williamtnguyen/issue-tracker
```

Install dependencies and run applications (two terminal tabs):

Frontend:

```
cd client
npm install
npm start
```

Backend:

```
cd server
npm install
npm run dev
```

## System Diagram

![System Diagram](https://user-images.githubusercontent.com/42355738/100796324-4c888c80-33d5-11eb-84a1-43278ac73c65.png)
