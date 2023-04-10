import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Chip from '@material-ui/core/Chip';
import MUIDataTable from 'mui-datatables';

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
    }
  }
});
/*
  It uses npm mui-datatables. It's easy to use, you just describe columns and data collection.
  Checkout full documentation here :
  https://github.com/gregnb/mui-datatables/blob/master/README.md
*/
function UpcomingTrivias(props) {
  const columns = [
    {
      name: 'Owner',
      options: {
        filter: true
      }
    },
    {
      name: 'Title',
      options: {
        filter: false,
      }
    },
    {
      name: 'Description',
      options: {
        filter: false,
      }
    },
    {
      name: 'Category',
      options: {
        filter: true,
      }
    },
    {
      name: 'Questions',
      options: {
        filter: false,
      }
    },
    {
      name: 'Status',
      options: {
        filter: true,
        customBodyRender: (value) => {
          if (value === 'READY') {
            return (<Chip label="Ready" color="primary" />);
          }
          if (value === 'SCHEDULED') {
            return (<Chip label="Scheduled" color="secondary" />);
          }
          return ('');
        }
      },
    },
    {
      name: 'Scheduled At',
      options: {
        filter: false,
      }
    },
  ];

  const data = [
    ['Gabby George', 'Business Analyst', 'General Description', 'HQ Trivia', 30, 'SCHEDULED', '05-03-2023 10:00AM'],
    ['Gabby George', 'Business Analyst', 'General Description', 'HQ Trivia', 10, 'READY', ''],
    ['Gabby George', 'Business Analyst', 'General Description', 'HQ Trivia', 10, 'SCHEDULED', '04-13-2023 10:00AM'],
    ['Gabby George', 'Business Analyst', 'General Description', 'HQ Trivia', 30, 'READY', ''],
    ['Gabby George', 'Business Analyst', 'General Description', 'HQ Trivia', 20, 'SCHEDULED', '04-18-2023 10:00AM'],
  ];

  const options = {
    selectableRows: 'none',
    filterType: 'dropdown',
    responsive: 'vertical',
    rowsPerPage: 10,
    page: 0,
    print: false,
    download: false,
  };

  const { classes } = props;

  return (
    <div className={classes.table}>
      <MUIDataTable
        title="Upcoming Trivias"
        data={data}
        columns={columns}
        options={options}
      />
    </div>
  );
}

UpcomingTrivias.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(UpcomingTrivias);
