import React, { useState, useEffect } from 'react';
import TaskModal from './TaskModal';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles({
  container: {
    margin: '25px 0',
    display: 'flex',
    justifyContent: 'center',
  },
  paper: {
    maxWidth: 1000,
  },
  table: {
    minWidth: 650,
  },
  tableHead: {
    backgroundColor: '#f4f4f4',
  },
  mainTableCell: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  taskRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f4f4f4',
    },
  },
  statusCircle: {
    height: '10px',
    width: '10px',
    borderRadius: '50%',
    position: 'absolute',
    marginLeft: '-20px',
    marginTop: '4px',
  },
  statusToDo: {
    backgroundColor: 'red',
  },
  statusInProgress: {
    backgroundColor: 'orange',
  },
  statusInReview: {
    backgroundColor: 'yellow',
  },
  statusDone: {
    backgroundColor: 'limegreen',
  },
});

const statusMap = Object.freeze({
  TO_DO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
});

const AllTasksTable = (props) => {
  const classes = useStyles();
  const [rows, setRows] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState({});

  useEffect(() => {
    if (props.tasks) {
      setRows(props.tasks);
    }
  // eslint-disable-next-line react/destructuring-assignment
  }, [props.tasks]);

  const handleClick = (taskObject) => {
    setShowModal(true);
    setSelectedTask(taskObject);
  };

  return (
    <div className={classes.container}>
      <TableContainer component={Paper} className={classes.paper}>
        <Table
          className={classes.table}
          size="small"
          aria-label="a dense table"
        >
          <TableHead className={classes.tableHead}>
            <TableRow>
              <TableCell className={classes.mainTableCell}>Task ID</TableCell>
              <TableCell className={classes.mainTableCell} align="center">
                Title
              </TableCell>
              <TableCell className={classes.mainTableCell} align="center">
                Status
              </TableCell>
              <TableCell className={classes.mainTableCell} align="right">
                Reporters
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(rows).map((taskObject) => (
              <TableRow key={taskObject.taskId} className={classes.taskRow} onClick={() => handleClick(taskObject)}>
                <TableCell component="th" scope="row">
                  {taskObject.taskId}
                </TableCell>
                <TableCell align="center">{taskObject.title}</TableCell>
                <TableCell align="center">
                  <span
                    className={`${classes.statusCircle} ${
                      taskObject.status === 'TO_DO'
                        ? classes.statusToDo
                        : taskObject.status === 'IN_PROGRESS'
                          ? classes.statusInProgress
                          : taskObject.status === 'IN_REVIEW'
                            ? classes.statusInReview
                            : classes.statusDone
                    }`}
                  >
                  </span>
                  <span>{statusMap[taskObject.status]}</span>
                </TableCell>
                {typeof taskObject.reporters === 'string'
                || (Array.isArray(taskObject.reporters)
                  && taskObject.reporters.length === 1) ? (
                    <TableCell align="right">{taskObject.reporters}</TableCell>
                  ) : (
                    <TableCell align="right">
                      {taskObject.reporters[0]}...
                    </TableCell>
                  )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {showModal 
          && (
          <TaskModal 
            showModal={showModal}
            setShowModal={setShowModal}
            selectedTask={selectedTask}
          />
          )}
      </TableContainer>
    </div>
  );
};

export default AllTasksTable;
