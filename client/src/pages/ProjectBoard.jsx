import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext, TeamContext } from '../App';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuid } from 'uuid';

import Navbar from '../components/material-ui/Navbar';
import AllTasksTable from '../components/material-ui/AllTasksTable';
import { ButtonGroup, Button, Container } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import './ProjectBoard.scss';

const statusMap = Object.freeze({
  TO_DO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
});

/**
 * Handles events when a Draggable is moved onto a Droppable
 * @param {*} emission The object containing info about source & destination of the Droppable being dragged
 * @param {*} assignedTasks The component state
 * @param {*} setAssignedTasks The function to update component state
 * @param {*} projectName The current project name
 */
const onDragEnd = async (
  emission,
  assignedTasks,
  setAssignedTasks,
  projectName
) => {
  if (!emission.destination) return;

  const { source, destination } = emission;

  const sourceItems = assignedTasks[source.droppableId];
  const removedItem = sourceItems.splice(source.index, 1);
  const destinationItems = assignedTasks[destination.droppableId];
  destinationItems.splice(destination.index, 0, removedItem[0]);

  setAssignedTasks({
    ...assignedTasks,
    [source.droppableId]: sourceItems,
    [destination.droppableId]: destinationItems,
  });

  const updateTaskResult = await axios.post('/api/tasks/update-status', {
    projectName,
    taskId: Number(emission.draggableId),
    newStatus: destination.droppableId,
  });
};

const ProjectBoard = (props) => {
  const { isAuthenticated, githubUsername } = useContext(UserContext);
  const { teamName } = useContext(TeamContext);
  const { history, match } = props;

  const [assignedTasksView, setAssignedTasksView] = useState(true);
  const [allTasks, setAllTasks] = useState({});
  const [assignedTasks, setAssignedTasks] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      history.push('/login');
    } else if (!match.params.projectName) {
      history.push('/dashboard');
    } else {
      fetchTasksInProject();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, isAuthenticated, props]);

  const fetchTasksInProject = async () => {
    try {
      const apiResponse = await axios.get(
        `/api/tasks/${match.params.projectName}`
      );
      const { data } = apiResponse;
      const tasksMap = {
        TO_DO: [],
        IN_PROGRESS: [],
        IN_REVIEW: [],
        DONE: [],
      };
      Object.values(data.tasks).forEach((issueObject) => {
        tasksMap[issueObject.status].push(issueObject);
      });
      setAllTasks(data.tasks);
      setAssignedTasks(tasksMap);
    } catch (error) {
      console.error(error);
    }
  };

  const goBackToTeamPage = () => {
    history.push({
      pathname: `/team/${teamName}`,
    });
  };

  const goToCreateTaskForm = () => {
    history.push({
      pathname: '/project/add-task',
      state: { projectName: match.params.projectName },
    });
  };

  return (
    <div className="project__root">
      <Navbar />
      <Button onClick={goBackToTeamPage} style={{ marginTop: '20px' }}>
        <ArrowBackIosIcon />
        Back to Team
      </Button>
      <h1>{match.params.projectName}</h1>
      <ButtonGroup variant="text" style={{ border: '1px lightgrey solid' }}>
        <Button id="assignedTasks" onClick={() => setAssignedTasksView(true)}>
          Assigned Tasks
        </Button>
        <Button id="allTasks" onClick={() => setAssignedTasksView(false)}>
          All Tasks
        </Button>
      </ButtonGroup>
      {assignedTasksView ? (
        <h3>Tasks assigned to {githubUsername}:</h3>
      ) : (
        <h3>All tasks for {match.params.projectName}:</h3>
      )}
      {assignedTasksView ? (
        <div className="tasks__container">
          <DragDropContext
            onDragEnd={(emission) =>
              onDragEnd(
                emission,
                assignedTasks,
                setAssignedTasks,
                match.params.projectName
              )
            }
          >
            {Object.entries(assignedTasks).map(([status, tasks]) => {
              return (
                <div key={status} className="column__container">
                  <h1>{statusMap[status]}</h1>
                  <Droppable droppableId={status}>
                    {/* Droppable gives us provided props and current state in a callback function */}
                    {(provided, snapshot) => {
                      return (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={
                            snapshot.isDraggingOver
                              ? 'column__droppable column__droppable--is-dragging-over'
                              : 'column__droppable'
                          }
                        >
                          {tasks.map((task, index) => {
                            return (
                              <Draggable
                                key={task.taskId}
                                draggableId={String(task.taskId)}
                                index={index}
                              >
                                {/* Draggable gives us provided props and current state in a callback function */}
                                {(provided, snapshot) => {
                                  return (
                                    <div
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      ref={provided.innerRef}
                                      style={{
                                        ...provided.draggableProps.style,
                                      }}
                                      className={
                                        snapshot.isDragging
                                          ? 'item__draggable item__draggable--is-dragging'
                                          : 'item__draggable'
                                      }
                                    >
                                      {task.title}
                                    </div>
                                  );
                                }}
                              </Draggable>
                            );
                          })}
                          {/* React element that is used to increase available space in a Droppable during a drag when needed */}
                          {provided.placeholder}
                        </div>
                      );
                    }}
                  </Droppable>
                </div>
              );
            })}
          </DragDropContext>
        </div>
      ) : (
        <div>
          <Container>
            <AllTasksTable tasks={allTasks} />
          </Container>
          <Button
            onClick={goToCreateTaskForm}
            variant="contained"
            color="secondary"
          >
            Add New Task
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectBoard;
