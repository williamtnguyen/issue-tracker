import React, { useContext, createContext, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { UserContext } from '../../App';

const axios = require('axios');

export const SearchContext = createContext();
const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  appBar: {
    backgroundColor: '#ebebeb',
    color: 'black',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: '#fff',
    '&:hover': {
      backgroundColor: '#f7f7f7',
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
}));

const Navbar = () => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const { setIsAuthenticated, setGithubUsername } = useContext(UserContext);

  const searchContext = {
    teamSearchData,
    userSearchData,
    projectSearchData,
  };
  
  /**
   * state variables for handling the return of the search results
   * 
   */
  const [searchQuery, setSearchQuery] = useState('');
  const [teamSearchData, setTeamSearchData] = useState([]);
  const [userSearchData, setUserSearchData] = useState([]);
  const [projectSearchData, setProjectSearchData] = useState([]);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSearchInput = async (event) => {
    setSearchQuery(event.target.data);
    handleTeamSearch();
    handleUserSearch();
    handleProjectSearch();
  };

  const handleTeamSearch = async () => {
    const teamSearchResponse = await axios.get(`/api/searchResults/matching-teams/${searchQuery}`);
    const returnedTeamSearchData = teamSearchResponse.data;
    const teamNameRows = [];
    for (const teamName of returnedTeamSearchData) {
      teamNameRows.push(teamName);
    }
    setTeamSearchData(teamNameRows);
  };

  const handleUserSearch = async () => {
    const userSearchResponse = await axios.get(`/api/searchResult/matching-users/${searchQuery}`);
    const returnedUserSearchData = userSearchResponse.data;
    const userList = [];

    for (const userName of returnedUserSearchData) {
      userList.push(userName);
    }

    setUserSearchData(userList);
  };
  const handleProjectSearch = async () => {
    const projectSearchResponse = await axios.get(`api/searchResult/matching-projects/${searchQuery}`);
    const returnedProjectData = projectSearchResponse.data;
    const projectNames = [];

    for (const projectName of returnedProjectData) {
      projectNames.push(projectName);
    }
    setProjectSearchData(projectNames);
  };
  // Whenever this state changes, components will notice and redirect to login
  const logoutAndRedirect = () => {
    localStorage.removeItem('githubUsername');
    setIsAuthenticated(false);
    setGithubUsername('');
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>My Account</MenuItem>
      <MenuItem onClick={logoutAndRedirect}>Logout</MenuItem>
    </Menu>
  );

  return (
    <div className={classes.grow}>
      <AppBar className={classes.appBar} position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="open drawer"
          >
            <MenuIcon />
          </IconButton>
          <Typography className={classes.title} variant="h6" noWrap>
            trackr ©
          </Typography>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <SearchContext.Provider value={searchContext}>
              <InputBase
                placeholder="Search"
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                inputProps={{ 'aria-label': 'search' }}
                onChange={handleSearchInput}
              />
            </SearchContext.Provider>
          </div>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <IconButton aria-label="show 4 new mails" color="inherit">
              <Badge badgeContent={4} color="secondary">
                <MailIcon />
              </Badge>
            </IconButton>
            <IconButton aria-label="show 17 new notifications" color="inherit">
              <Badge badgeContent={17} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMenu}
    </div>
  );
};

export default Navbar;
