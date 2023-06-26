/* eslint-disable camelcase */
import React, { useEffect, useState, useCallback } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Snackbar from '@material-ui/core/Snackbar';
import MUIDataTable from 'mui-datatables';
import TriviaWrapper from 'enl-api/trivia/TriviaWrapper';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/EditSharp';
import CopyIcon from '@material-ui/icons/FileCopySharp';
import DeleteIcon from '@material-ui/icons/DeleteSharp';
import DeletedIcon from '@material-ui/icons/DeleteSweepSharp';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import pink from '@material-ui/core/colors/pink';
import Typography from '@material-ui/core/Typography';
import Type from 'enl-styles/Typography.scss';
import QuestionsModal from './QuestionsModal';
import QuestionsCustomToolbar from './QuestionsCustomToolbar';
import QuestionCategoryFilter from './QuestionCategoryFilter';
import SnackBarWrapper from '../common/SnackBarWrapper';
import AlertDialog from '../common/AlertDialog';

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
  choiceSelected: {
    padding: 5,
    backgroundColor: '#f96c04',
    color: '#fff'
  },
  choiceNormal: {
    backgroundColor: 'auto'
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
function Questions(props) {
  const [currentRow, setCurrentRow] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [filterList, setFilterList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deletedCategories, setDeletedCategories] = useState([]);
  const [openStyle, setOpen] = useState(false);
  const [variant, setVariant] = useState('');
  const [message, setMessage] = useState('');
  const [rowsSelected, setRowsSelected] = useState([]);
  const [rowsDeleted, setRowsDeleted] = useState([]);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [editAllowed, setEditAllowed] = useState(false);
  const [cloneAllowed, setCloneAllowed] = useState(false);
  const [deleteAllowed, setDeleteAllowed] = useState(false);
  const [undeleteAllowed, setUndeleteAllowed] = useState(false);
  const [showDeleted, setShowDeleted] = useState(true);
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState(10);
  const [page, setPage] = useState(0);
  const openRowMenu = Boolean(anchorEl2);
  const { classes } = props;

  const updateResult = useCallback((_variant, _message) => {
    console.log('updateResult called');
    setVariant(_variant);
    setMessage(_message);
    setOpen(true);
  });

  useEffect(async () => {
    console.log('executed only once!');
    const params = new URLSearchParams();
    const response = await api.getCategories(params);
    if (!response.success) {
      setCategories([]);
      updateResult('error', response.message);
    } else {
      setCategories(response.data);
      setDeletedCategories(response.data.filter(el => el.deleted).map(el1 => el1.name));
      const params1 = new URLSearchParams();
      params1.append('category', filterList ? JSON.stringify(filterList) : '');
      params1.append('show_deleted', showDeleted);
      const response1 = await api.getQuestions(params1);
      if (!response1.success) {
        updateResult('error', response1.message);
        setQuestions([]);
      } else {
        updateResult('success', 'Questions refreshed successfully');
        setQuestions(response1.data);
        setCount(response1.data.length);
      }
    }
  }, [showDeleted]);

  const handleCloseStyle = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const openModal = () => {
    if (!categories.length) {
      updateResult('error', 'No categories found, create one and try again.');
      return;
    }
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

  const openFilterDialog = () => {
    if (!categories.length) {
      updateResult('error', 'No categories found, create one and try again.');
      return;
    }

    setShowFilterDialog(true);
  };

  const closeFilterDialog = () => {
    setShowFilterDialog(false);
  };

  const refreshQuestions = async (filters = undefined) => {
    const params = new URLSearchParams();
    const response = await api.getCategories(params);
    if (!response.success) {
      setCategories([]);
      updateResult('error', response.message);
    } else {
      setCategories(response.data);
      setDeletedCategories(response.data.filter(el => el.deleted).map(el1 => el1.name));
      const params1 = new URLSearchParams();
      params1.append('category', filters ? JSON.stringify(filters) : JSON.stringify(filterList));
      params1.append('show_deleted', showDeleted);
      const response1 = await api.getQuestions(params1);
      if (!response1.success) {
        updateResult('error', response1.message);
        setQuestions([]);
      } else {
        updateResult('success', 'Questions refreshed successfully');
        setQuestions(response1.data);
        setCount(response1.data.length);
      }
    }

    setCurrentRow(false);
  };

  const submitFilters = async (filters) => {
    console.log('Current filters: ', filters);
    setFilterList(filters);
    setShowFilterDialog(false);
    await refreshQuestions(filters);
  };

  const toggleDeleted = () => {
    setShowDeleted(!showDeleted);
  };

  const saveResults = async (values) => {
    setShowModal(false);
    console.log(values);
    if (!values.answer) {
      updateResult('error', 'Invalid answer selection');
      return;
    }

    const response = values.id
      ? await api.updateQuestion(values)
      : await api.createQuestion(values);
    if (!response.success) {
      updateResult('error', response.message);
      return;
    }
    updateResult('success', 'QuestionsCustomToolbar '
                + (values.id ? 'updated' : 'added') + ' successfully');
    console.log('Questions', response.data);
    updateResult('success', 'Question'
                + (values.id ? 'updated' : 'added') + ' successfully');
    const filters = filterList;
    if (!filters.includes(values.category)) {
      filters.push(values.category);
      setFilterList(filters);
    }
    refreshQuestions(filters);
  };

  const onRowsDeleteConfirm = async () => {
    let ids = [];
    if (Object.keys(rowsDeleted).length) {
      ids = Object.keys(rowsDeleted).map((index) => questions[index][0]);
    } else {
      ids = [currentRow[0]];
    }
    const response = await api.toggleQuestions({ ids });
    if (!response.success) {
      updateResult('error', response.message);
    } else {
      updateResult('success', response.message);
    }
    refreshQuestions();
    setShowDeleteDialog(false);
    setRowsDeleted([]);
    setRowsSelected([]);
  };

  const onRowCloneConfirm = async () => {
    const id = currentRow[0];
    const response = await api.cloneQuestion({ id });
    if (!response.success) {
      updateResult('error', response.message);
    } else {
      updateResult('success', response.message);
    }
    refreshQuestions();
    setCurrentRow(false);
    setShowCloneDialog(false);
    setRowsSelected([]);
  };

  const onRowsDeleteCancel = () => {
    console.log('Questions Delete cancelled');
    setShowDeleteDialog(false);
    setCurrentRow(false);
    setRowsDeleted([]);
    setRowsSelected([]);
  };

  const onRowCloneCancel = () => {
    console.log('Question Clone cancelled');
    setCurrentRow(false);
    setShowCloneDialog(false);
    setRowsSelected([]);
  };

  const buildChoicesAndAnswer = (data) => {
    const selected_1 = data[3] === data[7] ? classes.choiceSelected : classes.choiceNormal;
    const selected_2 = data[4] === data[7] ? classes.choiceSelected : classes.choiceNormal;
    const selected_3 = data[5] === data[7] ? classes.choiceSelected : classes.choiceNormal;
    const selected_4 = data[6] === data[7] ? classes.choiceSelected : classes.choiceNormal;
    return (
      <React.Fragment>
        <div className={selected_1} >
          {data[3]}
        </div>
        <div className={selected_2} >
          {data[4]}
        </div>
        {data[5]
        && <div className={selected_3} gutterBottom>
          {data[5]}
        </div>}
        {data[6]
        && <div className={selected_4} gutterBottom>
          {data[6]}
        </div>}
      </React.Fragment>
    );
  };

  if (props.refresh) { refreshQuestions(); }

  const getCategoryName = (name) => (deletedCategories.includes(name)
    ? <del className={classes.deleted}>{name}</del>
    : name);

  const getQuestionName = (isDeleted, name) => (isDeleted
    ? <div className={classes.deleted}>
      <DeleteIcon className={classes.deleted}/>
      <Typography variant="caption" className={Type.bold}>&nbsp;<b>{name}</b></Typography><br/>
    </div>
    : <div>
      <Typography variant="caption" className={Type.bold}>&nbsp;<b>{name}</b></Typography><br/>
    </div>);

  const columns = [
    {
      name: 'Id',
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: 'Category',
      options: {
        display: true,
        filter: false,
        viewColumns: false,
        customBodyRender: (value, tableMeta, updateValue) => (
          <React.Fragment >
            {getCategoryName(tableMeta.rowData[1])}
          </React.Fragment>
        )
      }
    },
    {
      name: 'Question',
      options: {
        display: true,
        filter: false,
        filterOptions: { fullWidth: true },
        customBodyRender: (value, tableMeta, updateValue) => (
          <React.Fragment >
            {getQuestionName(tableMeta.rowData[8], tableMeta.rowData[2])}
          </React.Fragment>
        )
      }
    },
    {
      name: 'Choices & Answer',
      options: {
        display: true,
        filter: false,
        customBodyRender: (value, tableMeta, updateValue) => buildChoicesAndAnswer(tableMeta.rowData)
      }
    },
    {
      name: 'C2',
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: 'C3',
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: 'C4',
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: 'C5',
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: 'Action',
      options: {
        display: true,
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
                if (tableMeta.rowData[8] || tableMeta.rowData[0] !== localStorage.getItem('id')) setEditAllowed(false);
                else setEditAllowed(true);

                if (tableMeta.rowData[8] || tableMeta.rowData[0] === localStorage.getItem('id') || deletedCategories.includes(tableMeta.rowData[1])) setCloneAllowed(false);
                else setCloneAllowed(true);

                if (tableMeta.rowData[8] || tableMeta.rowData[0] === localStorage.getItem('id')) setDeleteAllowed(false);
                else setDeleteAllowed(true);

                if (tableMeta.rowData[4] && tableMeta.rowData[0] === localStorage.getItem('id')) setUndeleteAllowed(true);
                else setUndeleteAllowed(false);

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
    selectableRows: 'multiple',
    rowsSelected,
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
      <QuestionsCustomToolbar
        showDeleted={showDeleted}
        toggleDeleted={toggleDeleted}
        categoriesCount={categories.length}
        openModal={openModal}
        openFilterDialog={openFilterDialog}
        refreshQuestions={refreshQuestions}
      />
    ),
    onRowsDelete: (_rowsDeleted) => {
      setRowsDeleted(_rowsDeleted.lookup);
      setShowDeleteDialog(true);
      console.log('rowsDeleted', _rowsDeleted);
    },
    filter: false,
    textLabels: {
      body: {
        noMatch: 'Sorry, no questions found! Expand the categories in the filter section and try again.',
      }
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

      {showFilterDialog
        && <QuestionCategoryFilter
          categories={categories}
          filterList={filterList}
          onSubmit={submitFilters}
          onCancel={closeFilterDialog}
        />
      }

      {showDeleteDialog && !Object.keys(rowsDeleted).length
        && <AlertDialog
          title={currentRow[8] === true ? 'Undelete Question' : 'Delete Question'}
          description={currentRow[8] === true ? 'Are you sure you want to undelete selected Question?' : 'Are you sure you want to delete selected Question?'}
          cancel='Cancel'
          submit='Confirm'
          onSubmit={onRowsDeleteConfirm}
          onCancel={onRowsDeleteCancel}
        />
      }

      {showDeleteDialog && Object.keys(rowsDeleted).length
        && <AlertDialog
          title={'Toggle Deletion(s)'}
          description={'Are you sure you want to delete selected Question(s)?'}
          cancel='Cancel'
          submit='Confirm'
          onSubmit={onRowsDeleteConfirm}
          onCancel={onRowsDeleteCancel}
        />
      }

      {showCloneDialog
        && <AlertDialog
          title='Clone Question'
          description={'Are you sure you want to clone selected Question - "' + currentRow[2] + '"?'}
          cancel='Cancel'
          submit='Confirm'
          onSubmit={onRowCloneConfirm}
          onCancel={onRowCloneCancel}
        />
      }

      <MUIDataTable
        title="Questions"
        data={questions}
        columns={columns}
        options={options}
      />

      {showModal
        && <QuestionsModal
          open={showModal}
          data={currentRow}
          closeModal={closeModal}
          saveResults={saveResults}
        />
      }
    </div>
  );
}

Questions.propTypes = {
  classes: PropTypes.object.isRequired,
  refresh: PropTypes.bool
};

export default withStyles(styles)(Questions);
