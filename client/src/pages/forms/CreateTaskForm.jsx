import React, { useEffect, useState } from 'react';
import axios from 'axios';

import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Button, 
  FormControl,
  Box,
  Snackbar
} from '@material-ui/core';
import MomentUtils from '@date-io/moment';
import { Autocomplete, Alert } from '@material-ui/lab';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import './CreateTaskForm.scss'

const TaskToGithub = (props) => {
  const { history } = props;
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
    const getTeam = async () => {
      const response = await axios.get('/api/teams/CMPE 172');
      // const response = await axios.get(`/api/teams/props.teamName`);
      setTeamMembers(response.data.members);
    }
    getTeam();
  }, []);

  const dummyProps = {
    title: 'test from code',
    owner: 'gary-chang-2', 
    repoName: 'test',
    description: 'this issue was published from code' 
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = {
      ...dummyProps,
      title, 
      description,
      assignees,
      reporters,
      priority,
      dueDate,
      status
    }
    const createTaskResult = await axios.post('/api/tasks/create', {...dummyProps});
    if (createTaskResult.status === 200) {
      // history.push({
      //   pathname: `/team/${teamname}`,
      //   state: { refreshFlag: true }
      // });
      console.log('success');
    } else {
      return (
        <Snackbar 
          open={() => setShowSnackbar(true)} 
          autoHideDuration={5000} 
          onClose={() => setShowSnackbar(false)}>
          <Alert onClose={() => setShowSnackbar(false)} severity="error">
            Task can't be added at the moment
          </Alert>
        </Snackbar>
      );
    }
  }

  return (
    <Box className='form__container'>
      <form
        className='task__form' 
        onSubmit={(e) => handleSubmit(e)} 
        noValidate 
        autoComplete='off'
      >
        <Box mb={2}>
          <TextField 
            label='Title' 
            inputProps={{ 'aria-label': 'description' }} 
            onChange = {(e) => setTitle(e.target.value)}
            fullWidth 
            required
          />
        </Box>

        <Box mb={2}>
          <Autocomplete
            multiple
            options={teamMembers}
            getOptionLabel={(member) => member}
            onChange={(e, members) => setAssignees(members)}
            renderInput={params => (
              <TextField
                {...params}
                variant='standard'
                label='Assignees'
                placeholder='Team member'
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
            renderInput={params => (
              <TextField
                {...params}
                variant='standard'
                label='Reporters'
                placeholder='Team member'
              />
            )}
          />
        </Box>

        <Box mb={2}>
          <FormControl fullWidth>
            <InputLabel id='priorty'>Priority</InputLabel>
            <Select
              labelId='priorty'
              open={showPriority}
              onClose={() => setShowPriority(false)}
              onOpen={() => setShowPriority(true)}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <MenuItem value='Low'>Low</MenuItem>
              <MenuItem value='Medium'>Medium</MenuItem>
              <MenuItem value='High'>High</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box mb={2}>
          <FormControl fullWidth>
            <InputLabel id='status'>Status</InputLabel>
            <Select
              labelId='status'
              open={showStatus}
              onClose={() => setShowStatus(false)}
              onOpen={() => setShowStatus(true)}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value='Todo'>Todo</MenuItem>
              <MenuItem value='In progress'>In progress</MenuItem>
              <MenuItem value='Finished'>Finished</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box mb={2}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <KeyboardDatePicker
              autoOk
              variant='inline'
              format='MM/dd/yyyy'
              margin='normal'
              label='Due Date'
              value={dueDate}
              onChange={(date) => setDueDate(date)}
              fullWidth
            />
          </MuiPickersUtilsProvider>
        </Box>

        <Box mb={2}>
          <TextField
            multiline
            variant='outlined'
            label='Description' 
            inputProps={{ 'aria-label': 'description' }} 
            onChange = {(e) => setDescription(e.target.value)}
            fullWidth
          />
        </Box>

        <Button type='submit' variant='outlined' color='primary'>Submit</Button>
      </form>
    </Box>
  )
}

export default TaskToGithub;
