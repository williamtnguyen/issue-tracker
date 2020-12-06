import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {SearchContext} from '../components/material-ui/Navbar';

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
  projectRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f4f4f4',
    },
  },
});


const searchResults = (props) => {
    const classes = useStyles();
    const [teamRows,setTeamRows] = useState([]);
    const [userRows,setUserRows] = useState([]);
    const [projectRows,setProjectRows] = useState([]);
}


export default searchResults;