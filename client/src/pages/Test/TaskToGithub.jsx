import React, { useEffect, useState } from 'react';
import axios from 'axios';

import {
  Input,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Button 
} from '@material-ui/core';
import MomentUtils from '@date-io/moment';
import { Autocomplete } from '@material-ui/lab';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import './TaskToGithub.scss'

const TaskToGithub = (props) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('');
  const [assignees, setAssignees] = useState([]);
  const [reporters, setReporters] = useState([]);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showPriority, setShowPriority] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  
  // Get team members in a project 
  useEffect(() => {
    const getTeam = async () => {
      const response = await axios.get('/api/teams/CMPE 172');
      setTeamMembers(response.data.members);
    }
    getTeam();
  }, []);

  const requestBody = {
    owner: '1234momo', 
    repo: 'test', 
    title: 'test1', 
    body: 'this is a test'
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('call backend');
    const params = {
      ...requestBody,
      title,
      assignees,
      reporters,
      priority,
      description,
      dueDate
    }
    const githubCall = await axios.post('/api/tasks/create', params);
    console.log(githubCall);
  }

  return (
    <div className="form__container">
      <form
        className='task__form' 
        onSubmit={(e) => handleSubmit(e)} 
        noValidate 
        autoComplete="off">
        <Input 
          placeholder='Title' 
          inputProps={{ 'aria-label': 'description' }} 
          onChange = {(e) => setTitle(e.target.value)}
        />
        <Autocomplete
          multiple
          options={teamMembers}
          getOptionLabel={(member) => member}
          defaultValue={teamMembers[0]}
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
        <Autocomplete
          multiple
          options={teamMembers}
          getOptionLabel={(member) => member}
          defaultValue={teamMembers[0]}
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
        <InputLabel id="Priorty">Priority</InputLabel>
        <Select
          labelId="Priorty"
          open={showPriority}
          onClose={() => setShowPriority(false)}
          onOpen={() => setShowPriority(true)}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value='Todo'>Todo</MenuItem>
          <MenuItem value='In progress'>In progress</MenuItem>
          <MenuItem value='Finished'>Finished</MenuItem>
        </Select>
        <Input 
          placeholder='Description' 
          inputProps={{ 'aria-label': 'description' }} 
          onChange = {(e) => setDescription(e.target.value)}
        />
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <KeyboardDatePicker
            disableToolbar
            variant="inline"
            format="MM/dd/yyyy"
            margin="normal"
            label="Date picker inline"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
          />
        </MuiPickersUtilsProvider>
        <Button type='submit' variant='outlined' color='primary'>Submit</Button>
      </form>
    </div>
  )
}

export default TaskToGithub;
