/* eslint-disable camelcase */
/* eslint-disable no-plusplus */
import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import MUIDataTable from 'mui-datatables';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import Type from 'enl-styles/Typography.scss';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TriviaWrapper from 'enl-api/trivia/TriviaWrapper';
import classNames from 'classnames';
import { Divider } from '@material-ui/core';
import TriviaQuestionChooserForm from './TriviaQuestionChooserForm';
// import '../styles/question-tpl.css';

const api = new TriviaWrapper();

const styles = theme => ({
  overrides: {
    MUIDataTableToolbar: { root: { display: 'none' } },
  },
  root: {
    flexGrow: 1,
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
  paper: {
    padding: 10
  },
  center: {
    textAlign: 'center'
  },
  left: {
    textAlign: 'left'
  },
  right: {
    textAlign: 'right'
  },
  middle: {
    verticalAlign: 'middle',
  },
  stepLabel: {
    cursor: 'pointer'
  },
  choiceSelected: {
    padding: 5,
    backgroundColor: '#009191',
    color: '#fff'
  },
  choiceNormal: {
    backgroundColor: 'auto'
  },
  search: {
    margin: 5,
  },
  que_text: {
    textAlign: 'left',
    fontSize: '1em !important',
    fontWeight: '600  !important',
  },
  choiceMargin: {
    margin: 10
  },
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
  }
});

function TriviaQuestionChooser(props) {
  const {
    step,
    onClose,
    category,
    classes,
    ...other
  } = props;
  const [options, setOptions] = React.useState([]);
  const [questions, setQuestions] = React.useState([]);
  const [open, setOpen] = React.useState(true);
  const [value, setValue] = React.useState(null);
  const [refresh, setRefresh] = React.useState(0);
  const [selectionMode, setSelectionMode] = React.useState('SEARCH');
  const [rowSelected, setRowSelected] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState(10);
  const [page, setPage] = useState(0);

  const radioGroupRef = React.useRef(null);

  const handleEntering = () => {
    if (radioGroupRef.current != null) {
      radioGroupRef.current.focus();
    }
  };

  const handleCancel = () => {
    onClose(step, null);
  };

  const handleOk = () => {
    if (selectionMode === 'SEARCH') {
      const q = options.find(el => el.id === value);
      if (q === undefined) return;
      onClose(step, q.question);
    } else {
      const q = {
        _id: questions[rowSelected][0],
        category: questions[rowSelected][1],
        question: questions[rowSelected][2],
        choice_1: questions[rowSelected][3],
        choice_2: questions[rowSelected][4],
        choice_3: questions[rowSelected][5],
        choice_4: questions[rowSelected][6],
        answer: questions[rowSelected][7],
        deleted: questions[rowSelected][8],
      };
      onClose(step, q);
    }
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleSelectionMode = async (event, newMode) => {
    if (!newMode) return;
    setSelectionMode(newMode);
    if (newMode === 'LIST') {
      const params = new URLSearchParams();
      params.append('category', JSON.stringify([category]));
      params.append('show_deleted', false);
      const response = await api.getQuestions(params);
      if (!response.success) {
        setQuestions([]);
      } else {
        setQuestions(response.data);
        setCount(response.data.length);
      }
    }
  };

  const searchQuestion = async (phrase) => {
    console.log('Searched for phrase', phrase);
    const response = await api.searchQuestions([category], phrase);
    if (response.success) {
      options.splice(0, options.length);
      response.questions.forEach(question => {
        options.push({ id: question._id, value: question.question, question });
      });
      setOptions(options);
      // eslint-disable-next-line no-shadow
      setRefresh((refresh) => refresh + 1);
    } else {
      console.log('error', response.message);
    }
  };

  const getQuestion = (data) => {
    const selected_1 = data[3] === data[7] ? classes.choiceSelected : classes.choiceNormal;
    const selected_2 = data[4] === data[7] ? classes.choiceSelected : classes.choiceNormal;
    const selected_3 = data[5] === data[7] ? classes.choiceSelected : classes.choiceNormal;
    const selected_4 = data[6] === data[7] ? classes.choiceSelected : classes.choiceNormal;
    return (
      <React.Fragment>
        <div className={classes.que_text}>
          <span>{data[2]}</span>
        </div>
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

  const CustomCheckbox = (_props) => {
    const newProps = { ..._props };
    newProps.color = props['data-description'] === 'row-select' ? 'secondary' : 'primary';

    if (_props['data-description'] === 'row-select') {
      return (<Radio {...newProps} />);
    }
    return (<Checkbox {...newProps} />);
  };

  const questionColumns = [
    {
      name: 'Id',
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: 'Question',
      sort: false,
      options: {
        display: true,
        filter: false,
        filterOptions: { fullWidth: true },
        customBodyRender: (val, tableMeta, updatedVal) => (
          <React.Fragment >
            {getQuestion(tableMeta.rowData)}
          </React.Fragment>
        ),
      }
    },
    {
      name: '',
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: '',
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: '',
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: '',
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: '',
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: '',
      options: { display: false, filter: false, viewColumns: false }
    },
    {
      name: '',
      options: { display: false, filter: false, viewColumns: false }
    },
  ];

  const questionOptions = {
    selectableRows: 'single',
    selectToolbarPlacement: 'none',
    rowsSelected: [rowSelected],
    responsive: 'vertical',
    filter: false,
    print: false,
    search: false,
    download: false,
    viewColumns: false,
    rowsPerPage,
    rowsPerPageOptions: [5, 10, 25, 50],
    count,
    page,
    jumpToPage: true,
    fixedHeader: true,
    onChangePage: currentPage => {
      console.log('currentPage: ' + currentPage);
      setPage(currentPage);
    },
    onChangeRowsPerPage: numberOfRows => {
      console.log('numberOfRows: ' + numberOfRows);
      setRowsPerPage(numberOfRows);
      setPage(0);
    },
    textLabels: {
      body: {
        noMatch: 'Sorry, no questions found! Choose a different category and try again.',
      }
    },
    onRowSelectionChange: rows => {
      setRowSelected(rows[0].index);
    }
  };

  return (
    <Dialog
      disableEscapeKeyDown
      fullWidth={true}
      maxWidth={'md'}
      TransitionProps={{
        onEntering: handleEntering
      }}
      aria-labelledby="confirmation-dialog-title"
      open={open}
      scroll={'paper'}
      PaperProps={{
        style: {
          overflowY: 'unset',
        },
      }}
      {...other}
    >
      <DialogTitle id="confirmation-dialog-title">
        <div className={classes.dialogTitle}>
          Select Question
          <ToggleButtonGroup value={selectionMode} exclusive onChange={handleSelectionMode}>
            <ToggleButton value="SEARCH">
              SEARCH
            </ToggleButton>
            <ToggleButton value="LIST">
              LIST
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      </DialogTitle>
      {selectionMode === 'SEARCH'
      && <div class={classes.search}>
        <Divider variant="fullWidth" />
        <TriviaQuestionChooserForm handleSubmit={(phrase) => searchQuestion(phrase)} />
      </div>}
      <Divider/>
      <DialogContent dividers>
        {selectionMode === 'SEARCH'
        && <RadioGroup
          ref={radioGroupRef}
          aria-label="ringtone"
          name="ringtone"
          value={value}
          onChange={handleChange}
        >
          {options.map((option) => (
            <div id={option.id}>
              <FormControlLabel value={option.id}
                key={option.id} control={<Radio />} label={<span className={classes.que_text}>{option.value}</span>} />
              <section>
                <div className={classNames(classes.choiceMargin, classes.option_list)}>
                  <div className={option.question.choice_1 === option.question.answer ? classes.choiceSelected : classes.choiceNormal}>
                    <span>{option.question.choice_1}</span>
                  </div>
                  {option.question.choice_2
                      && <div className={option.question.choice_2 === option.question.answer ? classes.choiceSelected : classes.choiceNormal}
                      ><span>{option.question.choice_2}</span>
                      </div>}
                  {option.question.choice_3
                      && <div className={option.question.choice_3 === option.question.answer ? classes.choiceSelected : classes.choiceNormald_3}>
                        <span>{option.question.choice_3}</span>
                      </div>}
                  {option.question.choice_4
                      && <div className={option.question.choice_4 === option.question.answer ? classes.choiceSelected : classes.choiceNormal}>
                        <span>{option.question.choice_4}</span>
                      </div>}
                </div>
              </section>
            </div>
          ))}
        </RadioGroup>}
        {selectionMode === 'LIST'
        && <div>
          <MUIDataTable
            // title="Questions"
            data={questions}
            columns={questionColumns}
            options={questionOptions}
            components={{
              Checkbox: CustomCheckbox,
            }}
          />
        </div>}
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={handleOk} color="primary">
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}

TriviaQuestionChooser.propTypes = {
  onClose: PropTypes.func.isRequired,
  step: PropTypes.number.isRequired,
  category: PropTypes.string.isRequired,
};

export default withStyles(styles)(TriviaQuestionChooser);
