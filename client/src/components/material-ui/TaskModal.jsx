import React, { useState } from 'react';
import { Modal, Backdrop, Fade } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: '0.2'
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  }
}));

const TaskModal = (props) => {
  const {
    setShowModal,
    showModal,
    selectedTask
  } = props;
  const classes = useStyles();


  return (
    <Modal
      className={classes.modal}
      open={showModal}
      onClose={() => setShowModal(false)}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={showModal}>
        <div className={classes.paper}>
          <Box mb={2}>
            <TextField 
              label='Title' 
              inputProps={{ 'aria-label': 'description' }} 
              fullWidth 
              required
            />
          </Box>

          <Box mb={2}>
            <Autocomplete
              multiple
              options={teamMembers}
              getOptionLabel={(member) => member}
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
        </div>
      </Fade>
    </Modal>
  );
}

export default TaskModal;
