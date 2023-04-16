import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import MomentUtils from '@date-io/moment';
import Typography from '@material-ui/core/Typography';
import Snackbar from '@material-ui/core/Snackbar';
import Type from 'enl-styles/Typography.scss';
import MUIDataTable from 'mui-datatables';
import TriviaWrapper from 'enl-api/trivia/TriviaWrapper';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import pink from '@material-ui/core/colors/pink';
import EditIcon from '@material-ui/icons/EditSharp';
import CopyIcon from '@material-ui/icons/FileCopySharp';
import DeleteIcon from '@material-ui/icons/DeleteSharp';
import LockOpenIcon from '@material-ui/icons/LockOpenSharp';
import LiveHelpIcon from '@material-ui/icons/LiveHelpSharp';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEyeSharp';
import ViewCarouselIcon from '@material-ui/icons/ViewCarousel';
import green from '@material-ui/core/colors/green';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import TriviasCustomToolbar from './TriviasCustomToolbar';
import TriviasModal from './TriviasModal';
import TriviaQR from './TriviaQR';
import TriviaAdminQR from './TriviaAdminQR';
import TriviaQuestionsForm from './TriviaQuestionsForm';
import TriviaPreview from './TriviaPreview';
import SnackBarWrapper from '../common/SnackBarWrapper';
import QRCodeIcon from '../styles/qrcodeIcon';
import AlertDialog from '../common/AlertDialog';

const api = new TriviaWrapper();
const utils = new MomentUtils();
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
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
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
function Trivias(props) {
  const [currentRow, setCurrentRow] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showTriviaQuestions, setShowTriviaQuestions] = useState(false);
  const [showTriviaPreview, setShowTriviaPreview] = useState(false);
  const [trivias, setTrivias] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deletedCategories, setDeletedCategories] = useState([]);
  const [openStyle, setOpen] = useState(false);
  const [variant, setVariant] = useState('');
  const [message, setMessage] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [showAdminQRCode, setAdminShowQRCode] = useState(false);
  const [rowsSelected, setRowsSelected] = useState([]);
  const [rowsDeleted, setRowsDeleted] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [showReopenDialog, setShowReopenDialog] = useState(false);
  const [reopenAllowed, setReopenAllowed] = useState(false);
  const [editAllowed, setEditAllowed] = useState(false);
  const [deleteAllowed, setDeleteAllowed] = useState(false);
  const [cloneAllowed, setCloneAllowed] = useState(false);
  const [showDeleted, setShowDeleted] = useState(true);
  const { classes } = props;
  const [anchorEl2, setAnchorEl2] = React.useState(null);
  const openRowMenu = Boolean(anchorEl2);

  const updateResult = React.useCallback((_variant, _message) => {
    console.log('updateResult called');
    setVariant(_variant);
    setMessage(_message);
    setOpen(true);
  });

  useEffect(async () => {
    const params = new URLSearchParams();
    const response = await api.getCategories(params);
    if (!response.success) {
      setCategories([]);
      updateResult('error', response.message);
    } else {
      setCategories(response.data);
      setDeletedCategories(response.data.filter(el => el.deleted).map(el1 => el1.name));
      const params1 = new URLSearchParams();
      params1.append('as_array', true);
      params1.append('show_deleted', showDeleted);
      const response1 = await api.getTrivias(params1);
      if (!response1.success) {
        updateResult('error', response1.message);
        setTrivias([]);
        return;
      }
      console.log('Trivias', response1.data);
      setTrivias(response1.data);
    }
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

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentRow(false);
  };

  const closeQRCode = () => {
    setShowQRCode(false);
    setCurrentRow(false);
  };

  const closeAdminQRCode = () => {
    setAdminShowQRCode(false);
    setCurrentRow(false);
  };

  const closeTriviaQuestions = () => {
    setShowTriviaQuestions(false);
    setCurrentRow(false);
  };

  const closeTriviaPreview = () => {
    setShowTriviaPreview(false);
    setCurrentRow(false);
  };

  const refreshTrivias = async () => {
    const params = new URLSearchParams();
    const response = await api.getCategories(params);
    if (!response.success) {
      setCategories([]);
      updateResult('error', response.message);
    } else {
      setCategories(response.data);
      setDeletedCategories(response.data.filter(el => el.deleted).map(el1 => el1.name));
      const params1 = new URLSearchParams();
      params1.append('as_array', true);
      params1.append('show_deleted', showDeleted);
      const response1 = await api.getTrivias(params1);
      if (!response1.success) {
        updateResult('error', response1.message);
        setTrivias([]);
        return;
      }
      console.log('Trivias', response1.data);
      setTrivias(response1.data);
      setCurrentRow(false);
    }
  };

  const toggleDeleted = () => {
    setShowDeleted(!showDeleted);
  };

  const saveResults = async (values) => {
    console.log(utils.moment().diff(utils.moment(values.start_at)));
    setShowModal(false);
    // eslint-disable-next-line no-param-reassign
    if (values.scheduled && utils.moment().diff(utils.moment(values.start_at)) < -10000) { values = { ...values, status: 'SCHEDULED' }; }

    const response = values.id
      ? await api.updateTrivia(values)
      : await api.createTrivia(values);
    if (!response.success) {
      updateResult('error', response.message);
      return;
    }
    updateResult('success', 'Trivia '
                + (values.id ? 'updated' : 'added') + ' successfully');
    refreshTrivias();
  };

  const saveQuestions = async (values) => {
    setShowTriviaQuestions(false);
    const response = values.id
      ? await api.updateTrivia(values)
      : await api.createTrivia(values);
    if (!response.success) {
      updateResult('error', response.message);
      return;
    }
    updateResult('success', 'Trivia '
                + (values.id ? 'updated' : 'added') + ' successfully');
    console.log(values);
    refreshTrivias();
  };

  const buildSchedule = (data) => (
    <React.Fragment>
      {!data[6]
        && <div>
          <Typography variant="caption" className={classes.title} gutterBottom> - </Typography>
        </div>
      }
      {data[6]
        && <div>
          <Typography variant="caption" className={classes.desc} gutterBottom>
            Start At: <br/>{utils.moment(data[7]).format('HH:mm MMM DD, YYYY')}
          </Typography>
        </div>
      }
    </React.Fragment>
  );

  if (props.refresh) refreshTrivias();

  const getCategoryName = (name) => (deletedCategories.includes(name)
    ? <Typography variant="caption" className={Type.bold}><del className={classes.deleted}><b>{name}</b></del></Typography>
    : <Typography variant="caption" className={Type.bold}>{name}</Typography>);

  const getTriviaName = (isDeleted, name, description) => (isDeleted
    ? <div>
      <Typography variant="caption" className={Type.bold}><del className={classes.deleted}><b>{name}</b></del></Typography><br/>
      <Typography variant="caption" className={Type.italic}><i>{description}</i></Typography>
    </div>
    : <div>
      <Typography variant="caption" className={Type.bold}><b>{name}</b></Typography><br/>
      <Typography variant="caption" className={Type.italic}><i>{description}</i></Typography>
    </div>);

  const onRowsDeleteConfirm = async () => {
    let ids = [];
    if (Object.keys(rowsDeleted).length) {
      ids = Object.keys(rowsDeleted).map((index) => trivias[index][0]);
    } else {
      ids = [currentRow[0]];
    }
    const response = await api.deleteTrivias({ ids });
    if (!response.success) {
      updateResult('error', response.message);
    } else {
      updateResult('success', response.message);
    }
    refreshTrivias();
    setShowDeleteDialog(false);
    setRowsSelected([]);
    setRowsDeleted([]);
  };

  const onRowCloneConfirm = async () => {
    const id = currentRow[0];
    const response = await api.cloneTrivia({ id });
    if (!response.success) {
      updateResult('error', response.message);
    } else {
      updateResult('success', response.message);
    }
    refreshTrivias();
    setCurrentRow(false);
    setRowsSelected([]);
    setShowCloneDialog(false);
  };

  const onRowReopenConfirm = async () => {
    const id = currentRow[0];
    const response = await api.reopenTrivia({ id });
    if (!response.success) {
      updateResult('error', response.message);
    } else {
      updateResult('success', response.message);
    }
    refreshTrivias();
    setCurrentRow(false);
    setRowsSelected([]);
    setShowReopenDialog(false);
  };

  const onRowReopenCancel = () => {
    console.log('Trivia Reopen cancelled');
    setCurrentRow(false);
    setRowsSelected([]);
    setShowReopenDialog(false);
  };

  const onRowsDeleteCancel = () => {
    console.log('Trivias Delete cancelled');
    setShowDeleteDialog(false);
    setRowsSelected([]);
    setRowsDeleted([]);
  };

  const onRowCloneCancel = () => {
    console.log('Trivia Clone cancelled');
    setCurrentRow(false);
    setRowsSelected([]);
    setShowCloneDialog(false);
  };

  const columns = [
    {
      name: 'Id', // 0
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: 'Trivia', // 1, 2
      options: {
        filterOptions: { fullWidth: true },
        customBodyRender: (value, tableMeta, updateValue) => (
          <React.Fragment >
            {getTriviaName(tableMeta.rowData[14], tableMeta.rowData[1], tableMeta.rowData[2])}
          </React.Fragment>
        )
      }
    },
    {
      name: 'Audience', // 3
      options: {
        filterOptions: { fullWidth: true },
        customBodyRender: (value, tableMeta, updateValue) => (
          <React.Fragment>
            <div>
              <Typography variant="caption" className={Type.italic}>
                {tableMeta.rowData[3]}
              </Typography>
            </div>
          </React.Fragment>
        )
      }
    },
    {
      name: 'Category', // 4
      options: {
        filterOptions: { fullWidth: true },
        customBodyRender: (value, tableMeta, updateValue) => (
          <React.Fragment >
            {getCategoryName(tableMeta.rowData[4])}
          </React.Fragment>
        )
      }
    },
    {
      name: 'Questions Count', // 11
      options: {
        filter: false,
        customBodyRender: (value, tableMeta, updateValue) => (
          <React.Fragment>
            <div>
              <Typography variant="caption" className={Type.italic}>
                {tableMeta.rowData[11]}
              </Typography>
            </div>
          </React.Fragment>
        )
      }
    },
    {
      name: 'Time Limit', // 7
      options: {
        filter: false,
        customBodyRender: (value, tableMeta, updateValue) => (
          <React.Fragment>
            <div>
              <Typography variant="caption" className={Type.italic}>
                {tableMeta.rowData[12] + ' seconds'}
              </Typography>
            </div>
          </React.Fragment>
        )

      }
    },
    {
      name: 'Scheduled?', // 6, 7, 8
      options: {
        filter: false,
        customBodyRender: (value, tableMeta, updateValue) => buildSchedule(tableMeta.rowData)
      }
    },
    {
      name: 'Status', // 9
      options: {
        filter: true,
        customBodyRender: (value, tableMeta, updateValue) => (
          <React.Fragment>
            <Typography variant="caption" className={classes.title} gutterBottom>
              {tableMeta.rowData[9]}
            </Typography>
          </React.Fragment>
        )
      }
    },
    {
      name: 'Action',
      options: {
        filter: false,
        viewColumns: true,
        customBodyRender: (value, tableMeta, updateValue) => (
          <React.Fragment >
            <Tooltip title={'Build Questions'}>
              <IconButton className={classes.iconButton} variant="outlined" color="secondary" disabled={tableMeta.rowData[14]}
                onClick={(e) => {
                  if (tableMeta.rowData[14]) {
                    updateResult('warning', 'Trivia is marked as deleted, not supported');
                    return;
                  }
                  if (tableMeta.rowData[9] === 'STARTED') {
                    updateResult('warning', 'Trivia in progress, try again later');
                    return;
                  }
                  console.log(tableMeta);
                  setCurrentRow(tableMeta.rowData);
                  setShowTriviaQuestions(true);
                }}>
                <LiveHelpIcon/>
              </IconButton>
            </Tooltip>
            <Tooltip title={'Preview Trivia'}>
              <IconButton className={classes.iconButton} variant="outlined" color="secondary" disabled={tableMeta.rowData[14]}
                onClick={(e) => {
                  if (tableMeta.rowData[14]) {
                    updateResult('warning', 'Trivia is marked as deleted, not supported');
                    return;
                  }
                  if (tableMeta.rowData[5] && !tableMeta.rowData[5].length) {
                    updateResult('warning', 'Missing questions, build questions and try again');
                    return;
                  }
                  if (tableMeta.rowData[9] === 'STARTED') {
                    updateResult('warning', 'Trivia in progress, try again later');
                    return;
                  }
                  console.log(tableMeta);
                  setCurrentRow(tableMeta.rowData);
                  setShowTriviaPreview(true);
                }}>
                <ViewCarouselIcon/>
              </IconButton>
            </Tooltip>
            <Tooltip title={'Player QR Code'}>
              <IconButton className={classes.iconButton} variant="outlined" style={{ color: '#11C7AA' }} disabled={tableMeta.rowData[14]}
                onClick={(e) => {
                  if (tableMeta.rowData[14]) {
                    updateResult('warning', 'Trivia is marked as deleted, not supported');
                    return;
                  }
                  if (tableMeta.rowData[5] && !tableMeta.rowData[5].length) {
                    updateResult('warning', 'Missing questions, build questions and try again');
                    return;
                  }
                  setCurrentRow(tableMeta.rowData);
                  setShowQRCode(true);
                }}>
                <QRCodeIcon key="playerQR" width="16" height="16"/>
              </IconButton>
            </Tooltip>
            <Tooltip title={'Admin QR Code'}>
              <IconButton className={classes.iconButton} variant="outlined" style={{ color: '#f96c04' }} disabled={tableMeta.rowData[14]}
                onClick={(e) => {
                  if (tableMeta.rowData[14]) {
                    updateResult('warning', 'Trivia is marked as deleted, not supported');
                    return;
                  }
                  if (tableMeta.rowData[5] && !tableMeta.rowData[5].length) {
                    updateResult('warning', 'Missing questions, build questions and try again');
                    return;
                  }
                  setCurrentRow(tableMeta.rowData);
                  setAdminShowQRCode(true);
                }}>
                <QRCodeIcon key="adminQR" width="16" height="16"/>
              </IconButton>
            </Tooltip>
            <IconButton
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={(e) => {
                setCurrentRow(tableMeta.rowData);
                if (!tableMeta.rowData[14] && (tableMeta.rowData[9] === 'COMPLETED' || tableMeta.rowData[9] === 'ABORTED'
                    || tableMeta.rowData[9] === 'EXPIRED')) setReopenAllowed(true);
                else setReopenAllowed(false);

                if (tableMeta.rowData[14] || tableMeta.rowData[9] === 'COMPLETED' || tableMeta.rowData[9] === 'ABORTED'
                    || tableMeta.rowData[9] === 'EXPIRED' || tableMeta.rowData[9] === 'STARTED') setEditAllowed(false);
                else setEditAllowed(true);

                if (tableMeta.rowData[9] === 'STARTED') setDeleteAllowed(false);
                else setDeleteAllowed(true);

                if (deletedCategories.includes(tableMeta.rowData[4])) setCloneAllowed(false);
                else setCloneAllowed(true);

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
              {editAllowed
                && <MenuItem key={'Edit' + tableMeta.rowData[0]} onClick={(e) => {
                  handleCloseRowMenu();
                  setShowModal(true);
                }}>
                  <IconButton className={classes.iconButton} variant="outlined" color="secondary">
                    <EditIcon/>
                  </IconButton> Edit
                </MenuItem>}
              {reopenAllowed
                && <MenuItem key={'Reopen' + tableMeta.rowData[0]} onClick={(e) => {
                  handleCloseRowMenu();
                  setShowReopenDialog(true);
                }}>
                  <IconButton className={classes.iconButton} variant="outlined" color="secondary">
                    <LockOpenIcon/>
                  </IconButton> Reopen
                </MenuItem>}
              {cloneAllowed
                && <MenuItem key={'Clone' + tableMeta.rowData[0]} onClick={(e) => {
                  if (tableMeta.rowData[5] && !tableMeta.rowData[5].length) {
                    updateResult('warning', 'Missing questions, build questions and try again');
                    return;
                  }
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
                  </IconButton> Toggle Delete
                </MenuItem>}
            </Menu>
          </React.Fragment>
        ),
        setCellProps: () => ({ style: { height: 'auto', overflow: 'unset' } }),
      },
    },
    {
      name: '', // 0
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: '', // 0
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: '', // 0
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: '', // 0
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: '', // 0
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: '', // 0
      options: { display: false, filter: false, viewColumns: false }
    },
  ];

  const options = {
    // selectableRows: 'none',
    // resizableColumns: true,
    filterType: 'dropdown',
    // responsive: 'standard',
    responsive: 'vertical',
    // responsive: "scroll",
    rowsSelected,
    print: false,
    download: false,
    rowsPerPage: 10,
    customToolbar: () => (
      <TriviasCustomToolbar
        showDeleted={showDeleted}
        toggleDeleted={toggleDeleted}
        openModal={openModal}
        refreshTrivias={refreshTrivias}
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
          title={currentRow[8] === true ? 'Undelete Trivia(s)' : 'Delete Trivia(s)'}
          description={currentRow[8] === true ? 'Are you sure you want to undelete selected Trivia(s)?' : 'Are you sure you want to delete selected Trivia(s)?'}
          cancel='Cancel'
          submit='Confirm'
          onSubmit={onRowsDeleteConfirm}
          onCancel={onRowsDeleteCancel}
        />
      }

      {showDeleteDialog && Object.keys(rowsDeleted).length
        && <AlertDialog
          title={'Toggle Deletion(s)'}
          description={'Are you sure you want to delete/undelete selected Trivia(s)?'}
          cancel='Cancel'
          submit='Confirm'
          onSubmit={onRowsDeleteConfirm}
          onCancel={onRowsDeleteCancel}
        />
      }

      {showReopenDialog
        && <AlertDialog
          title='Reopen Trivia'
          description={'Are you sure you want to reopen selected Trivia - ' + currentRow[1] + '?'}
          cancel='Cancel'
          submit='Confirm'
          onSubmit={onRowReopenConfirm}
          onCancel={onRowReopenCancel}
        />
      }

      {showCloneDialog
        && <AlertDialog
          title='Clone Trivia'
          description={'Are you sure you want to clone selected Trivia - ' + currentRow[1] + '?'}
          cancel='Cancel'
          submit='Confirm'
          onSubmit={onRowCloneConfirm}
          onCancel={onRowCloneCancel}
        />
      }

      <MUIDataTable
        title="Trivias List"
        data={trivias}
        columns={columns}
        options={options}
      />

      {showQRCode
        && <TriviaQR
          open={showQRCode}
          close={closeQRCode}
          data={currentRow}
        />
      }
      {showAdminQRCode
        && <TriviaAdminQR
          open={showAdminQRCode}
          close={closeAdminQRCode}
          data={currentRow}
        />
      }
      {showModal
        && <TriviasModal
          open={showModal}
          close={closeModal}
          data={currentRow}
          saveResults={saveResults}
        />
      }

      {showTriviaQuestions
        && <TriviaQuestionsForm
          open={showTriviaQuestions}
          data={currentRow}
          closeModal={closeTriviaQuestions}
          saveQuestions={saveQuestions}
        />
      }

      {showTriviaPreview
        && <TriviaPreview
          open={showTriviaPreview}
          data={currentRow}
          closeModal={closeTriviaPreview}
        />
      }
    </div>
  );
}

Trivias.propTypes = {
  classes: PropTypes.object.isRequired,
  refresh: PropTypes.bool
};

export default withStyles(styles)(Trivias);
