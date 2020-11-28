import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../App';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuid } from 'uuid';
import Navbar from '../components/material-ui/Navbar';
import './ProjectBoard.scss';

const dummyItemData = [
  { id: uuid(), content: 'Vibe' },
  { id: uuid(), content: 'Vibe' },
  { id: uuid(), content: 'Vibe' },
  { id: uuid(), content: 'Vibe again' },
];

const dummyColumnData = {
  [uuid()]: {
    name: 'To Do',
    items: dummyItemData,
  },
  [uuid()]: {
    name: 'In Progress',
    items: [],
  },
  [uuid()]: {
    name: 'In Review',
    items: [],
  },
  [uuid()]: {
    name: 'Done',
    items: [],
  },
};

/**
 * Handles events when a Draggable is moved onto a Droppable
 * @param {*} emission The object containing info about source & destination of the Droppable being dragged
 * @param {*} columns The component state
 * @param {*} setColumns The function to update component state
 */
const onDragEnd = (emission, columns, setColumns) => {
  if (!emission.destination) return;

  const { source, destination } = emission;

  const sourceItems = columns[source.droppableId].items;
  const removedItem = sourceItems.splice(source.index, 1);
  const destinationItems = columns[destination.droppableId].items;
  destinationItems.splice(destination.index, 0, removedItem[0]);

  setColumns({
    ...columns,
    [source.droppableId]: {
      ...columns[source.droppableId],
      items: sourceItems,
    },
    [destination.droppableId]: {
      ...columns[destination.droppableId],
      items: destinationItems,
    },
  });
};

const ProjectBoard = (props) => {
  const { isAuthenticated, githubUsername } = useContext(UserContext);
  const [columns, setColumns] = useState(dummyColumnData);

  useEffect(() => {
    const { history } = props;
    if (!isAuthenticated) {
      history.push('/login');
    }
  }, [props, isAuthenticated]);

  return (
    <div className="project__root">
      <Navbar />
      <h1>hi, {githubUsername}</h1>
      <div className="tasks__container">
        <DragDropContext
          onDragEnd={(emission) => onDragEnd(emission, columns, setColumns)}
        >
          {Object.entries(columns).map(([id, columnData]) => {
            return (
              <div key={id} className="column__container">
                <h1>{columnData.name}</h1>
                <Droppable droppableId={id}>
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
                        {columnData.items.map((item, index) => {
                          return (
                            <Draggable
                              key={item.id}
                              draggableId={item.id}
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
                                    {item.content}
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
    </div>
  );
};

export default ProjectBoard;
