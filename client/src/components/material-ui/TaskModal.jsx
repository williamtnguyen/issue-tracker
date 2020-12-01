import React from 'react';
import {
  Chip, Dialog, withStyles, IconButton 
} from '@material-ui/core';
import './TaskModal.scss';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogTitle from '@material-ui/core/DialogTitle';

import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import CloseIcon from '@material-ui/icons/Close';
import NoteIcon from '@material-ui/icons/Note';

const TaskModal = (props) => {
  const { setShowModal, showModal, selectedTask } = props;
  const {
    title,
    description,
    assignees,
    reporters,
    priority,
    dueDate,
    status,
  } = selectedTask;

  const formatDueDate = () => {
    const splitDueDate = dueDate.split('T');
    const date = splitDueDate[0].split('-');

    return `${date[1]}/${date[2]}/${date[0]}`;
  };

  const statusColor = () => {
    if (status === 'TO_DO') return { backgroundColor: 'red' };
    if (status === 'IN_PROGRESS') return { backgroundColor: 'orange' };
    if (status === 'IN_REVIEW') return { backgroundColor: 'yellow' };
    if (status === 'DONE') return { backgroundColor: 'limegreen' };
  };

  const statusLabel = () => {
    if (status === 'TO_DO') return 'To Do';
    if (status === 'IN_PROGRESS') return 'In Progress';
    if (status === 'IN_REVIEW') return 'In Review';
    if (status === 'DONE') return 'Done';
  };

  const priorityColor = () => {
    if (priority === 'Low') return { backgroundColor: 'limegreen' };
    if (priority === 'Medium') return { backgroundColor: 'orange' };
    if (priority === 'High') return { backgroundColor: 'red' };
  };

  const styles = (theme) => ({
    root: {
      margin: 0,
      padding: theme.spacing(3),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

  const DialogTitle = withStyles(styles)((props) => {
    const {
      children, classes, onClose, ...other 
    } = props;
    return (
      <MuiDialogTitle disableTypography className={classes.root} {...other}>
        {children}
        {onClose ? (
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
    );
  });

  const DialogContent = withStyles((theme) => ({
    root: {
      padding: theme.spacing(2),
    },
  }))(MuiDialogContent);

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <Dialog
      onClose={handleClose}
      open={showModal}
      BackdropProps={{ style: { opacity: '0.2' } }}
      PaperProps={{ style: { boxShadow: 'none' } }}
      fullWidth
    >
      <DialogTitle onClose={handleClose}>
        <h1 style={{ margin: '0' }}>
          {title}
          {status && (
            <span>
              {'  '}
              <Chip label={statusLabel()} style={statusColor()} />{' '}
              {priority && status !== 'DONE' && (
                <Chip label={priority} style={priorityColor()} />
              )}
            </span>
          )}
        </h1>
      </DialogTitle>
      <DialogContent className="dialog-content" dividers>
        {assignees && assignees.length > 0 && (
          <div id="content">
            <h3>
              <i>
                <AssignmentIndIcon id="icon" />
              </i>
              Assignees:{' '}
            </h3>
            {assignees.map((assignee, i) => (
              <Chip
                key={i}
                label={assignee}
                color="primary"
                style={{ fontWeight: 'normal', marginRight: '0.5em' }}
              />
            ))}
          </div>
        )}
        {reporters && reporters.length > 0 && (
          <div id="content">
            <h3>
              <i>
                <EmojiPeopleIcon id="icon" />
              </i>
              Reporters:{' '}
            </h3>
            {typeof reporters === 'object' ? (
              reporters.map((reporter, i) => (
                <Chip
                  key={i}
                  label={reporter}
                  color="primary"
                  style={{ fontWeight: 'normal', marginRight: '0.5em' }}
                />
              ))
            ) : (
              <Chip
                label={reporters}
                color="primary"
                style={{ fontWeight: 'normal' }}
              />
            )}
          </div>
        )}
        {dueDate && dueDate.length > 0 && (
          <div id="content">
            <h3>
              <i>
                <CalendarTodayIcon id="icon" />
              </i>
              Due Date:{' '}
            </h3>
            <p>{formatDueDate()}</p>
          </div>
        )}
        {description && description.length > 0 && (
          <div id="content">
            <h3>
              <i>
                <NoteIcon id="icon" />
              </i>
              Description:{' '}
            </h3>
            <p>{description}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
