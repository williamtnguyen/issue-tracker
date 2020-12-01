import React, { useEffect, useContext, useState } from 'react';
import { UserContext, TeamContext } from '../../App';
import axios from 'axios';

import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Button,
  FormControl,
  Box,
  Snackbar,
} from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Navbar from '../../components/material-ui/Navbar';
import MomentUtils from '@date-io/moment';
import { Autocomplete, Alert } from '@material-ui/lab';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import './CreateTaskForm.scss';

const TaskToGithub = (props) => {
  const { isAuthenticated, githubUsername } = useContext(UserContext);
  const { teamName } = useContext(TeamContext);
  const { history } = props;
  const [projectName, setProjectName] = useState('');

  const [title, setTitle] = useState('');
  const [assignees, setAssignees] = useState([]);
  const [reporters, setReporters] = useState([]);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showPriority, setShowPriority] = useState(false);
  const [priority, setPriority] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  const [status, setStatus] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  // Get team members in a project
  useEffect(() => {
    if (!isAuthenticated) {
      history.push('/login');
    }
    setProjectName(props.location.state.projectName);
    setTeamMembersForDropdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, isAuthenticated, props]);

  const setTeamMembersForDropdown = async () => {
    const response = await axios.get(`/api/teams/${teamName}`);
    setTeamMembers(response.data.members);
  };

  const goBackToProjectPage = () => {
    history.push({
      pathname: `/project/${projectName}`,
      state: { refreshFlag: true },
    });
  };

  const contextProps = {
    projectName,
    owner: githubUsername,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      ...contextProps,
      title,
      description,
      assignees,
      reporters,
      priority,
      dueDate,
      status,
    };

    try {
      const createTaskResult = await axios.post('/api/tasks/create', {
        ...formData,
      });
      if (createTaskResult) {
        goBackToProjectPage();
      }
    } catch (error) {
      setShowSnackbar(true);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="create__task__root">
        <div>
          <Button onClick={goBackToProjectPage}>
            <ArrowBackIosIcon />
            Back to Project
          </Button>
          <h1>Please enter new task information:</h1>
          <Box>
            <form
              className="task__form"
              onSubmit={(e) => handleSubmit(e)}
              noValidate
              autoComplete="off"
            >
              <Box mb={2}>
                <TextField
                  required
                  label="Title"
                  inputProps={{ 'aria-label': 'description' }}
                  onChange={(e) => setTitle(e.target.value)}
                  fullWidth
                />
              </Box>

              <Box mb={2}>
                <Autocomplete
                  multiple
                  options={teamMembers}
                  getOptionLabel={(member) => member}
                  onChange={(e, members) => setAssignees(members)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Assignees"
                      placeholder="Team member"
                    />
                  )}
                />
              </Box>

              <Box mb={2}>
                <Autocomplete
                  multiple
                  options={teamMembers}
                  getOptionLabel={(member) => member}
                  onChange={(e, members) => setReporters(members)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Reporters"
                      placeholder="Team member"
                    />
                  )}
                />
              </Box>

              <Box mb={2}>
                <FormControl fullWidth>
                  <InputLabel id="priorty">Priority</InputLabel>
                  <Select
                    labelId="priorty"
                    open={showPriority}
                    onClose={() => setShowPriority(false)}
                    onOpen={() => setShowPriority(true)}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box mb={2}>
                <FormControl fullWidth>
                  <InputLabel id="status">Status</InputLabel>
                  <Select
                    labelId="status"
                    open={showStatus}
                    onClose={() => setShowStatus(false)}
                    onOpen={() => setShowStatus(true)}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <MenuItem value="TO_DO">To do</MenuItem>
                    <MenuItem value="IN_PROGRESS">In progress</MenuItem>
                    <MenuItem value="IN_REVIEW">In review</MenuItem>
                    <MenuItem value="DONE">Done</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box mb={2}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                  <KeyboardDatePicker
                    autoOk
                    variant="inline"
                    format="MM/dd/yyyy"
                    margin="normal"
                    label="Due Date"
                    value={dueDate}
                    onChange={(date) => setDueDate(date)}
                    fullWidth
                  />
                </MuiPickersUtilsProvider>
              </Box>

              <Box mb={2}>
                <TextField
                  multiline
                  variant="outlined"
                  label="Description"
                  inputProps={{ 'aria-label': 'description' }}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                />
              </Box>
              <Button type="submit" variant="contained" color="primary">
                Submit
              </Button>
            </form>
            {showSnackbar && (
              <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={showSnackbar}
                autoHideDuration={3000}
                onClose={() => setShowSnackbar(false)}
              >
                <Alert onClose={() => setShowSnackbar(false)} severity="error">
                  Task can't be added at the moment
                </Alert>
              </Snackbar>
            )}
          </Box>
        </div>
      </div>
    </div>
  );
};

export default TaskToGithub;
