import React, { useEffect, useState } from 'react';
import axios from 'axios';

import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Button, 
  FormControl,
  Box
} from '@material-ui/core';
import MomentUtils from '@date-io/moment';
import { Autocomplete } from '@material-ui/lab';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import './TaskToGithub.scss'

const TaskToGithub = (props) => {
  const [title, setTitle] = useState('');
  const [assignees, setAssignees] = useState([]);
  const [reporters, setReporters] = useState([]);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showPriority, setShowPriority] = useState(false);
  const [priority, setPriority] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  const [status, setStatus] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  
  // Get team members in a project 
  useEffect(() => {
    const getTeam = async () => {
      const response = await axios.get('/api/teams/CMPE 172');
      setTeamMembers(response.data.members);
    }
    getTeam();
  }, []);

  const dummyProps = {
    owner: '1234momo', 
    repo: 'test', 
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('call backend');
    const body = {
      ...dummyProps,
      title: 'test2', 
      description: 'this is a test from app',
      assignees,
      reporters,
      priority,
      dueDate
    }
    const githubCall = await axios.post('/api/tasks/create', dummyProps);
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
