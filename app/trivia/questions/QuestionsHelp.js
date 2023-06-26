import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import Type from 'enl-styles/Typography.scss';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import classNames from 'classnames';
import QuestionsUpload from './QuestionsUpload';
import QuestionsTemplateDownload from './QuestionsTemplateDownload';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  leftIcon: {
    marginRight: theme.spacing(1),
  },
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
  paper: {
    minHeight: 200,
    padding: 10
  }

}));

function QuestionsHelp(props) {
  const { updateResult } = props;
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div className={classes.root}>
      <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <Typography className={classes.heading}>
            <span className={Type.bold}>
              About Question
            </span>
          </Typography>
          <Typography className={classes.secondaryHeading}></Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography component={'span'} variant={'body2'}>
            <p>In Trivia, questions are the critical user interaction point.
            This section lists the existing questions and the category it belongs to.
            It is a best practice to check and make sure that a question does not exist, before creating a new one.</p>
            <h6>Creating a Question</h6>
            <p>A Question is the key touch point of interaction when it is played out. A Question consists of a Category that it belongs to (picked from
              the existing list of Categories), a question text and upto four choices to choose from. It is mandatory that a question must have at
              least two choices. The correct choice for the question can be earmarked by selecting appropriate choice during question creation
               - only a single choice is allowed.
            </p>
            <p>
              <h6>Managing Questions</h6>
              <ol>
                <li>A Question can be edited anytime with changes to choice text and answer selection as well as moving .</li>
                <li>When a Question is deleted, it will be marked as deleted (soft-delete).</li>
              </ol>
            </p>

          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2bh-content"
          id="panel2bh-header"
        >
          <Typography className={classes.heading}>
            <span className={Type.bold}>
              Bulk Management
            </span>
          </Typography>
          <Typography className={classes.secondaryHeading}></Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div>
            <Grid container alignItems="flex-start" direction="row" spacing={2}>
              <Grid item xs={12} sm={4}>
                <Paper className={classes.paper}>
                  <Typography component={'span'} variant={'body2'}>
                    <span className={classNames(Type.bold, Type.underline)}>Bulk Import Template</span><br/><br/>
                    Download the bulk import template, a TSV (tab-delimited) file for bulk import.<br/><br/>
                    <QuestionsTemplateDownload />
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper className={classes.paper}>
                  <Typography component={'span'} variant={'body2'}>
                    <span className={classNames(Type.bold, Type.underline)}>Bulk Import</span><br/><br/>
                    Import the questions TSV (tab-delimited) file.<br/><br/>
                    <QuestionsUpload updateResult={updateResult}/>
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper className={classes.paper}>
                  <Typography component={'span'} variant={'body2'}>
                    <span className={classNames(Type.bold, Type.underline)}>Bulk Delete</span><br/><br/>
                    Export the questions presented in the table as TSV (tab-delimited) file.<br/><br/>
                    <QuestionsUpload updateResult={updateResult}/>
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

QuestionsHelp.propTypes = {
  updateResult: PropTypes.func.isRequired,
};

export default QuestionsHelp;
