/* eslint-disable camelcase */
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Snackbar from '@material-ui/core/Snackbar';
import { withStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/DeleteSharp';
import DeletedIcon from '@material-ui/icons/DeleteSweepSharp';
import EditIcon from '@material-ui/icons/EditSharp';
import CopyIcon from '@material-ui/icons/FileCopySharp';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Tooltip from '@material-ui/core/Tooltip';
import ShareIcon from '@material-ui/icons/ShareSharp';
import TriviaWrapper from 'enl-api/trivia/TriviaWrapper';
import MUIDataTable from 'mui-datatables';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import pink from '@material-ui/core/colors/pink';
import Typography from '@material-ui/core/Typography';
import Type from 'enl-styles/Typography.scss';
import SnackBarWrapper from '../common/SnackBarWrapper';
// eslint-disable-next-line import/no-cycle
import AlertDialog from '../common/AlertDialog';
import CategoriesCustomToolbar from './CategoriesCustomToolbar';
import CategoriesModal from './CategoriesModal';

const api = new TriviaWrapper();

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
function Categories(props) {
  const [currentRow, setCurrentRow] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [openStyle, setOpen] = useState(false);
  const [variant, setVariant] = useState('');
  const [message, setMessage] = useState('');
  const [rowsSelected, setRowsSelected] = useState([]);
  const [rowsDeleted, setRowsDeleted] = useState([]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [editAllowed, setEditAllowed] = useState(false);
  const [deleteAllowed, setDeleteAllowed] = useState(false);
  const [undeleteAllowed, setUndeleteAllowed] = useState(false);
  const [cloneAllowed, setCloneAllowed] = useState(false);
  const [shareAllowed, setShareAllowed] = useState(false);
  const [unshareAllowed, setUnshareAllowed] = useState(false);
  const [showDeleted, setShowDeleted] = useState(true);
  const [anchorEl2, setAnchorEl2] = React.useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState(10);
  const [page, setPage] = useState(0);
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
    const response = await api.getCategories(params);
    if (!response.success) {
      updateResult('error', response.message);
      setCategories([]);
      return;
    }
    console.log('Categories', response.data);
    updateResult('success', 'Categories refreshed successfully');
    setCategories(response.data);
    setCount(response.data.length);
  }, [showDeleted]);

  const handleCloseStyle = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentRow(false);
  };

  const handleCloseRowMenu = () => {
    setAnchorEl2(null);
  };

  const handleClickRowMenu = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const refreshCategories = async () => {
    const params = new URLSearchParams();
    params.append('as_array', true);
    params.append('show_deleted', showDeleted);
    const response = await api.getCategories(params);
    if (!response.success) {
      updateResult('error', response.message);
      setCategories([]);
      return;
    }
    console.log('Categories', response.data);
    setCategories(response.data);
    setCount(response.data.length);
    setCurrentRow(false);
  };

  const toggleDeleted = () => {
    setShowDeleted(!showDeleted);
  };

  const saveResults = async (values) => {
    setShowModal(false);
    console.log(values);

    const response = values.id
      ? await api.updateCategory(values)
      : await api.createCategory(values);
    if (!response.success) {
      updateResult('error', response.message);
      return;
    }
    updateResult('success', 'Category '
                + (values.id ? 'updated' : 'added') + ' successfully');
    console.log('Categories', response.data);
    updateResult('success', 'Category '
                + (values.id ? 'updated' : 'added') + ' successfully');
    refreshCategories();
  };

  const onRowsDeleteConfirm = async () => {
    let ids = [];
    if (Object.keys(rowsDeleted).length) {
      ids = Object.keys(rowsDeleted).map((index) => categories[index][0]);
    } else {
      ids = [currentRow[0]];
    }
    const response = await api.deleteCategories({ ids });
    if (!response.success) {
      updateResult('error', response.message);
    } else {
      updateResult('success', response.message);
    }
    refreshCategories();
    setShowDeleteDialog(false);
    setRowsDeleted([]);
    setRowsSelected([]);
  };

  const onRowCloneConfirm = async () => {
    const id = currentRow[0];
    const response = await api.cloneCategory({ id });
    if (!response.success) {
      updateResult('error', response.message);
    } else {
      updateResult('success', response.message);
    }
    refreshCategories();
    setCurrentRow(false);
    setRowsSelected([]);
    setShowCloneDialog(false);
  };

  const onRowShareConfirm = async () => {
    const id = currentRow[0];
    const response = await api.toggleCategoryShare({ id });
    if (!response.success) {
      updateResult('error', response.message);
    } else {
      updateResult('success', response.message);
    }
    refreshCategories();
    setCurrentRow(false);
    setRowsSelected([]);
    setShowShareDialog(false);
  };

  const onRowsDeleteCancel = () => {
    console.log('Categories Delete cancelled');
    setShowDeleteDialog(false);
    setRowsSelected([]);
    setRowsDeleted([]);
  };

  const onRowCloneCancel = () => {
    console.log('Category Clone cancelled');
    setCurrentRow(false);
    setRowsSelected([]);
    setShowCloneDialog(false);
  };

  const onRowShareCancel = () => {
    console.log('Category Toggle share cancelled');
    setCurrentRow(false);
    setRowsSelected([]);
    setShowShareDialog(false);
  };

  if (props.refresh) refreshCategories();

  const { classes } = props;

  const getCategoryName = (isShared, isDeleted, name) => (isDeleted
    ? <div className={classes.deleted}>
      <DeletedIcon className={classes.deleted}/>
      <Typography variant="caption" className={Type.bold}>&nbsp;<b>{name}</b></Typography><br/>
    </div>
    : <div>
      {isShared
        && <ShareIcon color="secondary"/>}
      <Typography variant="caption" className={Type.bold}>&nbsp;<b>{name}</b></Typography><br/>
    </div>);

  const columns = [
    {
      name: 'Id',
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: 'Name',
      options: {
        filterOptions: { fullWidth: true },
        customBodyRender: (value, tableMeta, updateValue) => (
          <React.Fragment >
            {getCategoryName(tableMeta.rowData[5], tableMeta.rowData[4], tableMeta.rowData[1])}
          </React.Fragment>
        )
      }
    },
    {
      name: 'Description',
      options: { filter: false, }
    },
    {
      name: 'No. of Questions',
      options: { filter: false, }
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
                if (tableMeta.rowData[4]) setEditAllowed(false);
                else setEditAllowed(true);

                if (tableMeta.rowData[4]) setCloneAllowed(false);
                else setCloneAllowed(true);

                if (tableMeta.rowData[4]) setDeleteAllowed(false);
                else setDeleteAllowed(true);

                if (tableMeta.rowData[4]) setUndeleteAllowed(true);
                else setUndeleteAllowed(false);

                if (tableMeta.rowData[5] || tableMeta.rowData[4] || !tableMeta.rowData[3]) setShareAllowed(false);
                else setShareAllowed(true);

                if (tableMeta.rowData[5] && !tableMeta.rowData[4]) setUnshareAllowed(true);
                else setUnshareAllowed(false);

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
                  maxHeight: 256,
                  width: '20ch',
                },
              }}
            >
              {editAllowed
              && <MenuItem key={'Edit' + tableMeta.rowData[0]} onClick={(e) => {
                handleCloseRowMenu();
                setShowModal(true);
              }}>
                <IconButton className={classes.iconButton} variant="outlined" color="secondary">
                  <EditIcon/>
                </IconButton> Edit
              </MenuItem>}
              {cloneAllowed
              && <MenuItem key={'Clone' + tableMeta.rowData[0]} onClick={(e) => {
                handleCloseRowMenu();
                setShowCloneDialog(true);
              }}>
                <IconButton className={classes.iconButton} variant="outlined" color="secondary">
                  <CopyIcon/>
                </IconButton> Clone
              </MenuItem>}
              {shareAllowed
                && <MenuItem key={'Share' + tableMeta.rowData[0]} onClick={(e) => {
                  handleCloseRowMenu();
                  setShowShareDialog(true);
                }}>
                  <IconButton className={classes.iconButton} variant="outlined" color="secondary">
                    <ShareIcon/>
                  </IconButton> Share
                </MenuItem>}
              {unshareAllowed
                && <MenuItem key={'Unshare' + tableMeta.rowData[0]} onClick={(e) => {
                  handleCloseRowMenu();
                  setShowShareDialog(true);
                }}>
                  <IconButton className={classes.iconButton} variant="outlined" color="secondary">
                    <ShareIcon/>
                  </IconButton> Unshare
                </MenuItem>}
              {deleteAllowed
                && <MenuItem key={'Delete' + tableMeta.rowData[0]} onClick={(e) => {
                  handleCloseRowMenu();
                  setRowsDeleted([]);
                  setShowDeleteDialog(true);
                }}>
                  <IconButton className={classes.iconButton} variant="outlined" color="secondary">
                    <DeleteIcon/>
                  </IconButton> Delete
                </MenuItem>}
              {undeleteAllowed
                && <MenuItem key={'Undelete' + tableMeta.rowData[0]} onClick={(e) => {
                  handleCloseRowMenu();
                  setRowsDeleted([]);
                  setShowDeleteDialog(true);
                }}>
                  <IconButton className={classes.iconButton} variant="outlined" color="secondary">
                    <DeleteIcon/>
                  </IconButton> Undelete
                </MenuItem>}

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
    rowsPerPage,
    rowsPerPageOptions: [5, 10, 25, 50],
    count,
    page,
    jumpToPage: true,
    onChangePage: currentPage => {
      console.log('currentPage: ' + currentPage);
      setPage(currentPage);
    },
    onChangeRowsPerPage: numberOfRows => {
      console.log('numberOfRows: ' + numberOfRows);
      setRowsPerPage(numberOfRows);
      setPage(0);
    },
    customToolbar: () => (
      <CategoriesCustomToolbar
        showDeleted={showDeleted}
        toggleDeleted={toggleDeleted}
        openModal={openModal}
        refreshCategories={refreshCategories}
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

      {showCloneDialog
        && <AlertDialog
          title='Clone Question'
          description={'Are you sure you want to clone selected Category - "' + currentRow[1] + '"?'}
          cancel='Cancel'
          submit='Confirm'
          onSubmit={onRowCloneConfirm}
          onCancel={onRowCloneCancel}
        />
      }

      {showDeleteDialog && !Object.keys(rowsDeleted).length
        && <AlertDialog
          title={currentRow[14] === true ? 'Undelete Category' : 'Delete Category'}
          description={currentRow[14] === true ? 'Are you sure you want to undelete selected Category?' : 'Are you sure you want to delete selected Category?'}
          cancel='Cancel'
          submit='Confirm'
          onSubmit={onRowsDeleteConfirm}
          onCancel={onRowsDeleteCancel}
        />
      }

      {showDeleteDialog && Object.keys(rowsDeleted).length
        && <AlertDialog
          title={'Delete Category'}
          description={'Are you sure you want to delete selected Categories?'}
          cancel='Cancel'
          submit='Confirm'
          onSubmit={onRowsDeleteConfirm}
          onCancel={onRowsDeleteCancel}
        />
      }

      {showShareDialog
        && <AlertDialog
          title={currentRow[5] === true ? 'Unshare Category' : 'Share Category'}
          description={currentRow[5] === true ? 'Are you sure you want to unshare selected Category?' : 'Are you sure you want to share selected Category?'}
          cancel='Cancel'
          submit='Confirm'
          onSubmit={onRowShareConfirm}
          onCancel={onRowShareCancel}
        />
      }

      <MUIDataTable
        title="Categories List"
        data={categories}
        columns={columns}
        options={options}
      />

      {showModal
        && <CategoriesModal
          open={showModal}
          data={currentRow}
          closeModal={closeModal}
          saveResults={saveResults}
        />
      }
    </div>
  );
}

Categories.propTypes = {
  classes: PropTypes.object.isRequired,
  refresh: PropTypes.bool
};

export default withStyles(styles)(Categories);
