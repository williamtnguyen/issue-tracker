import React, { useState } from 'react';
import { Modal, Backdrop, Fade, Chip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  const {
    title,
    description,
    assignees,
    reporters,
    priority,
    dueDate,
    status,
  } = selectedTask;
  const classes = useStyles();
  console.log(selectedTask);

  const chipColor = () => {
    if (status === 'TO_DO')
      return 'red';
  }

  const renderReporters = () => {
    if (typeof(reporters) !== 'string') {
      reporters.map(reporter => {
        return (
          <Chip label={reporter} color='primary' />
        )
      });
    } else {
      return <Chip label={reporters} color='primary' />
    }
  }

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
          <h1>{title}{status && (<Chip label={status} color='primary'/>)}</h1>
          {assignees && assignees.length > 0 && <h3>Assignees: {assignees.map(assignee => {
            return (
              <Chip label={assignee} color='primary' />
            )
          })}</h3>}
          {reporters && reporters.length > 0 && <h3>Reporters: {renderReporters()}</h3>}
          {priority && priority.length > 0 && <h3>Priority: {priority}</h3>}
          {dueDate && dueDate.length > 0 && <h3>Due Date: {dueDate}</h3>}
          <h3>Description: {description && description.length > 0 && description}</h3>
        </div>
      </Fade>
    </Modal>
  );
}

export default TaskModal;
