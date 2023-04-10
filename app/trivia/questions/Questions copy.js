/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import MUIDataTable from 'mui-datatables';
import TriviaWrapper from 'enl-api/trivia/TriviaWrapper';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import EditIcon from '@material-ui/icons/EditSharp';
import CopyIcon from '@material-ui/icons/FileCopySharp';
import DeleteIcon from '@material-ui/icons/DeleteSharp';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import green from '@material-ui/core/colors/green';
import QuestionsModal from './QuestionsModal';
import QuestionsCustomToolbar from './QuestionsCustomToolbar';
import QuestionCategoryFilter from './QuestionCategoryFilter';
import SnackBarWrapper from '../common/SnackBarWrapper';
import AlertDialog from '../common/AlertDialog';

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
  choiceSelected: {
    padding: 5,
    backgroundColor: green[600],
    color: '#fff'
  },
  choiceNormal: {
    backgroundColor: 'auto'
  }
});

/*
  It uses npm mui-datatables. It's easy to use, you just describe columns and data collection.
  Checkout full documentation here :
  https://github.com/gregnb/mui-datatables/blob/master/README.md
*/
function Questions(props) {
  const defaultFilters = [[], ['Unclassified'], [], [], [], [], [], [], []];
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [filterList, setFilterList] = useState(defaultFilters);
  const [openStyle, setOpen] = useState(false);
  const [variant, setVariant] = useState('');
  const [message, setMessage] = useState('');
  const [rowsSelected, setRowsSelected] = useState([]);
  const [rowsDeleted, setRowsDeleted] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [anchorEl2, setAnchorEl2] = React.useState(null);
  const openRowMenu = Boolean(anchorEl2);
  const { classes } = props;

  const updateResult = React.useCallback((_variant, _message) => {
    console.log('updateResult called');
    setVariant(_variant);
    setMessage(_message);
    setOpen(true);
  });

  useEffect(async () => {
    console.log('executed only once!');
    const params = new URLSearchParams();
    params.append('category', JSON.stringify(filterList[1]));

    const response = await api.getQuestions(params);
    if (!response.success) {
      updateResult('error', response.message);
      setQuestions([]);
      return;
    }
    console.log('Questions', response.data);
    updateResult('success', 'Questions refreshed successfully');
    setQuestions(response.data);
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

  const openFilterDialog = async () => {
    setCategoryFilterOpen(true);
  };

  const refreshQuestions = async () => {
    console.log('executed only once!');
    const params = new URLSearchParams();
    params.append('category', JSON.stringify(filterList[1]));

    const response = await api.getQuestions(params);
    if (!response.success) {
      updateResult('error', response.message);
      setQuestions([]);
      return;
    }
    console.log('Questions', response.data);
    setQuestions(response.data);
    setCurrentRow(false);
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
    refreshQuestions();
  };

  const onRowsDeleteConfirm = async () => {
    let ids = [];
    if (Object.keys(rowsDeleted).length) {
      ids = Object.keys(rowsDeleted).map((index) => questions[index][0]);
    } else {
      ids = [currentRow[0]];
    }
    const response = await api.deleteQuestions({ ids });
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

  const columns = [
    {
      name: 'Id',
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: 'Category',
      options: {
        filter: true,
        onFilterChange: (changedColumn, changedColumnIndex, displayData) => {
          console.log(changedColumn, changedColumnIndex, displayData);
          changedColumnIndex.forEach((data, key) => {
            console.log(data, key);
          });
        },

        // filterList: ['Unclassified'],
        // onFilterChange: (columnChanged, filterList) => {
        //   console.log(`onFilterChange columnChanged: ${columnChanged}`);
        //   console.log(`filterList[1]: ${JSON.stringify(filterList[1])}`);
        //   setFilter(filterList[1]);
        // },
      },
    },
    {
      name: 'Question',
      options: { filter: false, }
    },
    {
      name: 'Choices & Answer',
      options: {
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

  const handleFilterSubmit = async (applyFilters) => {
    const newFilterList = applyFilters();
    console.log('Filters: ', newFilterList);
    setFilterList(newFilterList);
    const params = new URLSearchParams();
    params.append('category', JSON.stringify(newFilterList[1]));

    const response = await api.getQuestions(params);
    if (!response.success) {
      updateResult('error', response.message);
      setQuestions([]);
      return;
    }
    console.log('Questions', response.data);
    updateResult('success', 'Questions refreshed successfully');
    setQuestions(response.data);
  };

  const options = {
    // selectableRows: 'none',
    // resizableColumns: true,
    selectableRows: 'multiple',
    rowsSelected,
    responsive: 'vertical',
    print: false,
    download: false,
    rowsPerPage: 10,
    page: 0,
    customToolbar: () => (
      <QuestionsCustomToolbar
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
    // filterType: 'checkbox',
    // confirmFilters: true,

    // Calling the applyNewFilters parameter applies the selected filters to the table
    customFilterDialogFooter: (currentFilterList, applyNewFilters) => (
      <div style={{ marginTop: '40px' }}>
        <Button variant="contained" onClick={() => handleFilterSubmit(applyNewFilters)}>Apply Filters</Button>
      </div>
    ),

    // callback that gets executed when filters are confirmed
    onFilterConfirm: (newFilterList) => {
      console.log('onFilterConfirm');
      console.dir(newFilterList);
    },

    onFilterDialogOpen: () => {
      console.log('filter dialog opened');
    },
    onFilterDialogClose: () => {
      console.log('filter dialog closed');
    },
    onFilterChange: (column, newFilterList, type) => {
      if (type === 'chip') {
        const newFilters = () => (newFilterList);
        console.log('updating filters via chip');
        handleFilterSubmit(newFilters);
      }
    },
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
          title='Delete Question(s)'
          description='Are you sure you want to delete selected Question(s)?'
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
        title="Question List"
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
