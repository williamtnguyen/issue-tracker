import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  mainTableRow: {
    backgroundColor: '#f4f4f4',
  },
  mainTableCell: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  teamRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f4f4f4',
    },
  },
});

const TeamTable = (props) => {
  const classes = useStyles();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (props.teams) {
      setRows(props.teams);
    }
  // eslint-disable-next-line react/destructuring-assignment
  }, [props.teams]);

  const goToTeamPage = (teamName) => {
    props.history.push(`/team/${teamName}`);
  };

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow className={classes.mainTableRow}>
            <TableCell className={classes.mainTableCell}>Team Name</TableCell>
            <TableCell className={classes.mainTableCell} align="center">
              Total Members
            </TableCell>
            <TableCell className={classes.mainTableCell} align="right">
              Total Projects
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              className={classes.teamRow}
              onClick={() => goToTeamPage(row.name)}
            >
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="center">{row.totalMembers}</TableCell>
              <TableCell align="right">{row.totalProjects}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TeamTable;
