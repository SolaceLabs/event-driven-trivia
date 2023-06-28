/* eslint-disable no-plusplus */
import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import MomentUtils from '@date-io/moment';
import Typography from '@material-ui/core/Typography';
import Snackbar from '@material-ui/core/Snackbar';
import Type from 'enl-styles/Typography.scss';
import MUIDataTable from 'mui-datatables';
import TriviaWrapper from 'enl-api/trivia/TriviaWrapper';
import pink from '@material-ui/core/colors/pink';
import green from '@material-ui/core/colors/green';
import SnackBarWrapper from '../common/SnackBarWrapper';

const api = new TriviaWrapper();
const utils = new MomentUtils();

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
    backgroundColor: '#009191',
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
function UpcomingTrivias(props) {
  const [currentRow, setCurrentRow] = useState(false);
  const [trivias, setTrivias] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deletedCategories, setDeletedCategories] = useState([]);
  const [openStyle, setOpen] = useState(false);
  const [variant, setVariant] = useState('');
  const [message, setMessage] = useState('');
  const [rowsSelected, setRowsSelected] = useState([]);
  const [rowsDeleted, setRowsDeleted] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [count, setCount] = useState(5);
  const [page, setPage] = useState(0);
  const { classes } = props;

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
      const response1 = await api.getUpcomingTrivias(params1);
      if (!response1.success) {
        updateResult('error', response1.message);
        setTrivias([]);
        return;
      }
      console.log('UpcomingTrivias', response1.data);
      setTrivias(response1.data);
    }
  }, [showDeleted]);

  const handleCloseStyle = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
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
      console.log('UpcomingTrivias', response1.data);
      setTrivias(response1.data);
      setCurrentRow(false);
    }
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

  const getName = (name) => (
    <div>
      <Typography variant="caption" className={Type.bold}><i>{name}</i></Typography>
    </div>);

  const getTriviaName = (isDeleted, name, description) => (isDeleted
    ? <div>
      <Typography variant="caption" className={Type.bold}><del className={classes.deleted}><b>{name}</b></del></Typography><br/>
      <Typography variant="caption" className={Type.italic}><i>{description}</i></Typography>
    </div>
    : <div>
      <Typography variant="caption" className={Type.bold}><b>{name}</b></Typography><br/>
      <Typography variant="caption" className={Type.italic}><i>{description}</i></Typography>
    </div>);

  const columns = [
    {
      name: 'Id', // 0
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: 'Owner', // 0
      options: {
        filterOptions: { fullWidth: true },
        filter: true,
        customBodyRender: (value, tableMeta, updateValue) => (
          <React.Fragment >
            {getName(tableMeta.rowData[18])}
          </React.Fragment>
        )
      }
    },
    {
      name: 'Trivia', // 1, 2
      options: {
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
      name: 'Scheduled', // 6, 7, 8
      options: {
        filter: false,
        customBodyRender: (value, tableMeta, updateValue) => buildSchedule(tableMeta.rowData)
      }
    },
    {
      name: 'Status', // 9
      options: {
        filter: true,
        filterOptions: { fullWidth: true },
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
    selectableRows: 'none',
    // resizableColumns: true,
    filterType: 'dropdown',
    // responsive: 'standard',
    responsive: 'vertical',
    // responsive: "scroll",
    rowsSelected,
    print: false,
    download: false,
    rowsPerPage,
    rowsPerPageOptions: [5, 10],
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

      <MUIDataTable
        title="Upcoming Trivias"
        data={trivias}
        columns={columns}
        options={options}
      />
    </div>
  );
}

UpcomingTrivias.propTypes = {
  classes: PropTypes.object.isRequired,
  refresh: PropTypes.bool
};

export default withStyles(styles)(UpcomingTrivias);
