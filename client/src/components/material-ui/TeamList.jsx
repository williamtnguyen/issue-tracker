import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));

const TeamList = (props) => {
  const classes = useStyles();
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    if (props.teamMembers) {
      setTeamMembers(props.teamMembers);
    }
  // eslint-disable-next-line react/destructuring-assignment
  }, [props.teamMembers]);

  return (
    <List className={classes.root}>
      {teamMembers.map((teamMember, index) => {
        if (index !== teamMembers.length - 1) {
          return (
            <div key={teamMember}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar></Avatar>
                </ListItemAvatar>
                <ListItemText primary={teamMember} />
              </ListItem>
              <Divider variant="inset" component="li" />
            </div>
          );
        }
        return (
          <ListItem key={teamMember}>
            <ListItemAvatar>
              <Avatar></Avatar>
            </ListItemAvatar>
            <ListItemText primary={teamMember} />
          </ListItem>
        );
      })}
    </List>
  );
};

export default TeamList;
