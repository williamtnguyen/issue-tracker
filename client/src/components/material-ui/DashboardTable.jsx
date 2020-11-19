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
});

function createData(
  teamName,
  totalProjects,
  totalTasks,
  assignedTasks,
  completedTasks
) {
  return { teamName, totalProjects, totalTasks, assignedTasks, completedTasks };
}

const DashboardTable = (props) => {
  const classes = useStyles();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (props.teams) {
      const teams = [];
      props.teams.forEach((teamName) => {
        teams.push(createData(teamName, 1, 16, 5, 3));
      });
      setRows(teams);
    }
  }, [props.teams]);

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow className={classes.mainTableRow}>
            <TableCell className={classes.mainTableCell}>Team Name</TableCell>
            <TableCell className={classes.mainTableCell} align="right">
              Total Projects
            </TableCell>
            <TableCell className={classes.mainTableCell} align="right">
              Total Tasks
            </TableCell>
            <TableCell className={classes.mainTableCell} align="right">
              Assigned Tasks
            </TableCell>
            <TableCell className={classes.mainTableCell} align="right">
              Completed Tasks
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.teamName}>
              <TableCell component="th" scope="row">
                {row.teamName}
              </TableCell>
              <TableCell align="right">{row.totalProjects}</TableCell>
              <TableCell align="right">{row.totalTasks}</TableCell>
              <TableCell align="right">{row.assignedTasks}</TableCell>
              <TableCell align="right">{row.completedTasks}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DashboardTable;
