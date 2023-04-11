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
import SnackBarWrapper from '../common/SnackBarWrapper';
// eslint-disable-next-line import/no-cycle
import AlertDialog from '../common/AlertDialog';
import CategoriesCustomToolbar from './CategoriesCustomToolbar';
import CategoriesModal from './CategoriesModal';

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
  }
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
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
    params.append('as_array', 'true');
    const response = await api.getCategories(params);
    if (!response.success) {
      updateResult('error', response.message);
      setCategories([]);
      return;
    }
    console.log('Categories', response.data);
    updateResult('success', 'Categories refreshed successfully');
    setCategories(response.data);
  }, []);

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
    params.append('as_array', 'true');
    const response = await api.getCategories(params);
    if (!response.success) {
      updateResult('error', response.message);
      setCategories([]);
      return;
    }
    console.log('Categories', response.data);
    setCategories(response.data);
    setCurrentRow(false);
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

  if (props.refresh) refreshCategories();

  const { classes } = props;

  const columns = [
    {
      name: 'Id',
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: 'Name',
      options: { filterOptions: { fullWidth: true } }
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
      name: 'No. of Trivias',
      options: { filter: false, }
    },
    {
      name: '',
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
              <MenuItem key={'Edit' + tableMeta.rowData[0]} onClick={(e) => {
                handleCloseRowMenu();
                setShowModal(true);
              }}>
                <IconButton className={classes.iconButton} variant="outlined" color="secondary">
                  <EditIcon/>
                </IconButton> Edit
              </MenuItem>
              <MenuItem key={'Clone' + tableMeta.rowData[0]} onClick={(e) => {
                handleCloseRowMenu();
                setShowCloneDialog(true);
              }}>
                <IconButton className={classes.iconButton} variant="outlined" color="secondary">
                  <CopyIcon/>
                </IconButton> Clone
              </MenuItem>
              <MenuItem key={'Delete' + tableMeta.rowData[0]} onClick={(e) => {
                handleCloseRowMenu();
                setRowsDeleted([]);
                setShowDeleteDialog(true);
              }}>
                <IconButton className={classes.iconButton} variant="outlined" color="secondary">
                  <DeleteIcon/>
                </IconButton> Delete
              </MenuItem>
            </Menu>
          </React.Fragment>
        ),
        // setCellProps: () => ({ style: { maxWidth: "100px" }}),
      }
    }

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
      <CategoriesCustomToolbar
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

      {showDeleteDialog
        && <AlertDialog
          title='Delete Category(s)'
          description='This will also delete questions under this category, Are you sure you want to delete selected Category(s)?'
          cancel='Cancel'
          submit='Confirm'
          onSubmit={onRowsDeleteConfirm}
          onCancel={onRowsDeleteCancel}
        />
      }

      {showCloneDialog
        && <AlertDialog
          title='Clone Category'
          description={'Are you sure you want to clone selected Category - "' + currentRow[2] + '"?'}
          cancel='Cancel'
          submit='Confirm'
          onSubmit={onRowCloneConfirm}
          onCancel={onRowCloneCancel}
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
