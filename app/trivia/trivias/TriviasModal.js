import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import { PapperBlock } from 'enl-components';
import TriviasForm from './TriviasForm';

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function TriviasModal(props) {
  const {
    data, categories, saveResults, open, close
  } = props;
  const classes = useStyles();

  const handleClose = () => {
    close();
  };

  const handleSubmit = (values) => {
    console.log(values);
    saveResults(values);
  };

  return (
    <div>
      <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
        <PapperBlock
          title={'Trivia'}
          icon="question_answer"
          desc={'Create Trivia'}
          actionChildren={
            <IconButton edge="start" color="inherit" onClick={close} aria-label="close">
              <CloseIcon />
            </IconButton>
          }
        >
          <div>
            <TriviasForm data={data} categories={categories} onSubmit={(values) => handleSubmit(values)} />
          </div>
        </PapperBlock>
      </Dialog>
    </div>
  );
}

TriviasModal.propTypes = {
  close: PropTypes.func.isRequired
};
