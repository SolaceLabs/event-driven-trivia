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
import QuestionsForm from './QuestionsForm';

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

const Transition = React.forwardRef((tprops, ref) => <Slide direction="up" ref={ref} {...tprops} />);

export default function QuestionsModal(props) {
  const {
    data, saveResults, open, closeModal
  } = props;
  const classes = useStyles();

  const handleClose = () => {
    closeModal();
  };

  const handleSubmit = (values) => {
    console.log('Question Form:', values);
    saveResults(values);
  };

  return (
    <div>
      <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
        <PapperBlock
          title={'Question'}
          icon="live_help"
          desc={'Create Question'}
          actionChildren={
            <IconButton edge="start" color="inherit" onClick={closeModal} aria-label="close">
              <CloseIcon />
            </IconButton>
          }
        >
          <div>
            <QuestionsForm data={data} onSubmit={(values) => handleSubmit(values)} />
          </div>
        </PapperBlock>
      </Dialog>
    </div>
  );
}

QuestionsModal.propTypes = {
  closeModal: PropTypes.func.isRequired
};
