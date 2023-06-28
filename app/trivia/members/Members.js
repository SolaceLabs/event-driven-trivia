/* eslint-disable camelcase */
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Snackbar from '@material-ui/core/Snackbar';
import { withStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/DeleteSharp';
import EditIcon from '@material-ui/icons/EditSharp';
import CopyIcon from '@material-ui/icons/FileCopySharp';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import TriviaWrapper from 'enl-api/trivia/TriviaWrapper';
import MUIDataTable from 'mui-datatables';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import pink from '@material-ui/core/colors/pink';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import Type from 'enl-styles/Typography.scss';
import SnackBarWrapper from '../common/SnackBarWrapper';
// eslint-disable-next-line import/no-cycle
import AlertDialog from '../common/AlertDialog';
import MembersCustomToolbar from './MembersCustomToolbar';

const api = new TriviaWrapper();
const ITEM_HEIGHT = 48;

const styles = theme => ({
  table: {
    '& > div': {
      overflow: 'auto'
    },
    '& table': {
      '& td': {
        wordBreak: 'keep-all'
      },
      [theme.breakpoints.down('md')]: {
        '& td': {
          height: 60,
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }
    },
  },
  snackbar: {
    margin: theme.spacing(1),
  },
  divider: {
    margin: `${theme.spacing(3)}px 0`,
  },
  margin: {
    margin: theme.spacing(1)
  },
  deleted: {
    color: pink[400],
    '& svg': {
      fill: pink[400],
    }
  },
});

/*
  It uses npm mui-datatables. It's easy to use, you just describe columns and data collection.
  Checkout full documentation here :
  https://github.com/gregnb/mui-datatables/blob/master/README.md
*/
function Members(props) {
  const [currentRow, setCurrentRow] = useState(false);
  const [members, setMembers] = useState([]);
  const [openStyle, setOpen] = useState(false);
  const [variant, setVariant] = useState('');
  const [message, setMessage] = useState('');
  const [rowsSelected, setRowsSelected] = useState([]);
  const [rowsDeleted, setRowsDeleted] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [anchorEl2, setAnchorEl2] = React.useState(null);
  const openRowMenu = Boolean(anchorEl2);

  const updateResult = React.useCallback((_variant, _message) => {
    console.log('updateResult called');
    setVariant(_variant);
    setMessage(_message);
    setOpen(true);
  });

  useEffect(async () => {
    console.log('executed only once!');
    const params = new URLSearchParams();
    params.append('as_array', true);
    params.append('show_deleted', showDeleted);
    const response = await api.getMembers(params);
    if (!response.success) {
      updateResult('error', response.message);
      setMembers([]);
      return;
    }
    console.log('Members', response.data);
    updateResult('success', 'Members refreshed successfully');
    setMembers(response.data);
  }, [showDeleted]);

  const handleCloseStyle = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleCloseRowMenu = () => {
    setAnchorEl2(null);
  };

  const handleClickRowMenu = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const refreshMembers = async () => {
    const params = new URLSearchParams();
    params.append('as_array', true);
    params.append('show_deleted', showDeleted);
    const response = await api.getMembers(params);
    if (!response.success) {
      updateResult('error', response.message);
      setMembers([]);
      return;
    }
    console.log('Members', response.data);
    setMembers(response.data);
    setCurrentRow(false);
  };

  const toggleDeleted = () => {
    setShowDeleted(!showDeleted);
  };

  const saveResults = async (values) => {
    console.log(values);

    const response = values.id
      ? await api.updateMember(values)
      : await api.createMember(values);
    if (!response.success) {
      updateResult('error', response.message);
      return;
    }
    updateResult('success', 'Member '
                + (values.id ? 'updated' : 'added') + ' successfully');
    console.log('Members', response.data);
    updateResult('success', 'Member '
                + (values.id ? 'updated' : 'added') + ' successfully');
    refreshMembers();
  };

  const onRowsDeleteConfirm = async () => {
    let ids = [];
    if (Object.keys(rowsDeleted).length) {
      ids = Object.keys(rowsDeleted).map((index) => members[index][0]);
    } else {
      ids = [currentRow[0]];
    }
    const response = await api.deleteMembers({ ids });
    if (!response.success) {
      updateResult('error', response.message);
    } else {
      updateResult('success', response.message);
    }
    refreshMembers();
    setShowDeleteDialog(false);
    setRowsDeleted([]);
    setRowsSelected([]);
  };

  const onRowsDeleteCancel = () => {
    console.log('Members Delete cancelled');
    setShowDeleteDialog(false);
    setRowsSelected([]);
    setRowsDeleted([]);
  };

  if (props.refresh) refreshMembers();

  const { classes } = props;

  const getMemberName = (isDeleted, name) => (isDeleted
    ? <Typography variant="caption" className={Type.bold}><del className={classes.deleted}><b>{name}</b></del></Typography>
    : name);

  const getMemberStatus = (status, isDeleted, emailVerified) => (isDeleted
    ? <Chip label="DELETED" style={{ backgroundColor: '#ec407a' }} />
    : (emailVerified
      ? <Chip label={status} style={{ backgroundColor: '#03ac94' }} />
      : <Chip label={status} style={{ backgroundColor: '#d3d3d3' }} />));

  const columns = [
    {
      name: 'Id',
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: 'Name',
      options: {
        filter: false,
        customBodyRender: (value, tableMeta, updateValue) => (
          <React.Fragment >
            {getMemberName(tableMeta.rowData[5], tableMeta.rowData[1])}
          </React.Fragment>
        )
      }
    },
    {
      name: 'Email',
      options: { filter: false, }
    },
    {
      name: 'Role',
      options: {
        filterOptions: { fullWidth: true },
      }
    },
    {
      name: 'Status',
      options: {
        filterOptions: { fullWidth: true },
        customBodyRender: (value, tableMeta, updateValue) => (
          <React.Fragment >
            {console.log('status, isDeleted, emailVerified')}
            {console.log(tableMeta.rowData[4], tableMeta.rowData[5], tableMeta.rowData[6])}
            {getMemberStatus(tableMeta.rowData[4], tableMeta.rowData[5], tableMeta.rowData[6])}
          </React.Fragment>
        )
      }
    },
    {
      name: 'Action',
      options: {
        filter: false,
        viewColumns: false,
        customBodyRender: (value, tableMeta, updateValue) => (
          <React.Fragment >
            <IconButton
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={(e) => {
                setCurrentRow(tableMeta.rowData);
                handleClickRowMenu(e);
              }}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="long-menu"
              anchorEl={anchorEl2}
              keepMounted
              open={openRowMenu}
              onClose={handleCloseRowMenu}
              PaperProps={{
                style: {
                  maxHeight: ITEM_HEIGHT * 4.5,
                  width: '20ch',
                },
              }}
            >
              <MenuItem key={'Delete' + tableMeta.rowData[0]} onClick={(e) => {
                handleCloseRowMenu();
                setRowsDeleted([]);
                setShowDeleteDialog(true);
              }}>
                <IconButton className={classes.iconButton} variant="outlined" color="secondary">
                  <DeleteIcon/>
                </IconButton> { tableMeta.rowData[5] ? 'Undelete' : 'Delete' }
              </MenuItem>
            </Menu>
          </React.Fragment>
        ),
        // setCellProps: () => ({ style: { maxWidth: "100px" }}),
      }
    },
    {
      name: '', // 0
      options: { display: false, filter: false, viewColumns: false }
    },
  ];

  const options = {
    // selectableRows: 'none',
    // resizableColumns: true,
    rowsSelected,
    filterType: 'dropdown',
    responsive: 'vertical',
    print: false,
    download: false,
    rowsPerPage: 10,
    customToolbar: () => (
      <MembersCustomToolbar
        showDeleted={showDeleted}
        toggleDeleted={toggleDeleted}
        refreshMembers={refreshMembers}
      />
    ),
    onRowsDelete: (_rowsDeleted) => {
      setRowsDeleted(_rowsDeleted.lookup);
      setShowDeleteDialog(true);
      console.log('rowsDeleted', _rowsDeleted);
    }
  };

  return (
    <div className={classes.table}>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={openStyle}
        autoHideDuration={6000}
        onClose={() => handleCloseStyle()}
      >
        <SnackBarWrapper
          onClose={() => handleCloseStyle()}
          variant={variant}
          message={message}
          className={classes.margin}
        />
      </Snackbar>

      {showDeleteDialog && !Object.keys(rowsDeleted).length
        && <AlertDialog
          title={currentRow[8] === true ? 'Undelete Member(s)' : 'Delete Member(s)'}
          description={currentRow[8] === true ? 'Are you sure you want to undelete selected Member(s)?' : 'Are you sure you want to delete selected Member(s)?'}
          cancel='Cancel'
          submit='Confirm'
          onSubmit={onRowsDeleteConfirm}
          onCancel={onRowsDeleteCancel}
        />
      }

      {showDeleteDialog && Object.keys(rowsDeleted).length
        && <AlertDialog
          title={'Toggle Deletion(s)'}
          description={'Are you sure you want to delete/undelete selected Member(s)?'}
          cancel='Cancel'
          submit='Confirm'
          onSubmit={onRowsDeleteConfirm}
          onCancel={onRowsDeleteCancel}
        />
      }

      <MUIDataTable
        title="Members"
        data={members}
        columns={columns}
        options={options}
      />
    </div>
  );
}

Members.propTypes = {
  classes: PropTypes.object.isRequired,
  refresh: PropTypes.bool
};

export default withStyles(styles)(Members);
