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
import classNames from 'classnames';

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
  }
}));

function TriviasHelp(props) {
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
              About Trivia
            </span>
          </Typography>
          <Typography className={classes.secondaryHeading}></Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography component={'span'} variant={'body2'}>
            <h6>Creating a Trivia</h6>
            <p>A Trivia captures the essence of the quiz game with a set of questions and provides links and QR Codes to access game and controller pages.</p>
            <p>Trivia creation is a 2-step process. First you defined the context of a Trivia with details like name, description, target audience,
            time limit per question, questions category, number of questions and an optional scheduling details. Some of the details are used for
            analytics purpose. Then you populate the questions from the chosen category in the second step with the option of either random selection
            or a manual selection of questions.</p>
            <p>The most important parameters that determines the game are number of questions, questions category and time limit for answering a question.</p>
            <h6>Trivia Status</h6>
            <ul>
              <li><b>NEW</b> Trivia is created, but questions are yet to be populated</li>
              <li><b>READY</b> Trivia is created, populated with questions and the game can be launched anytime by the creator.</li>
              <li><b>STARTED</b> Trivia is launched and the game is in progress.</li>
              <li><b>SCHEDULED</b> Trivia is ready and scheduled for launch at a particular time.</li>
              <li><b>EXPIRED</b> Trivia was scheduled, but never launched.</li>
              <li><b>COMPLETED</b> Trivia was launched and the game is completed.</li>
              <li><b>ABORTED</b> Trivia was launched and the game was aborted midway.</li>
            </ul>
            <h6>Managing Trivias</h6>
            <ol>
              <li>A Trivia can be edited or reopened for a fresh launch anytime except when in COMPLETED, EXPIRED or ABORTED status.</li>
              <li>A Trivia can be deleted anytime except when it is in STARTED status, and the deletion will be a soft-delete (marked as deleted).</li>
              <li>A Trivia can be cloned anytime.</li>
            </ol>
          </Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

TriviasHelp.propTypes = {
  updateResult: PropTypes.func.isRequired,
};

export default TriviasHelp;
