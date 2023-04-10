/* eslint-disable no-unsafe-optional-chaining */
import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import UploadIcon from '@material-ui/icons/CloudUploadSharp';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

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

function QuestionsUpload(props) {
  const { updateResult } = props;
  const classes = useStyles();
  const [csvFile, setCsvFile] = React.useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('csvFile', csvFile);
    axios.post('/api/trivia/questions/upload', formData, {})
      .then(res => {
        console.log(res);
        updateResult('success', 'New questions upload successful');
      })
      .catch(err => {
        console.log(err.message + '\n' + err.response?.data);
        updateResult('error', 'Upload failed: ' + err.response?.data);
      });
  };

  return (
    <div className="container">
      <div className="row">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <input type="file" onChange={(e) => setCsvFile(e.target.files[0])} />
          </div>
          <div className="form-group">
            <Button className={classes.button} variant="contained" color="secondary" type="submit">
                Upload
              <UploadIcon className={classes.rightIcon}/>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

QuestionsUpload.propTypes = {
  forceUpdate: PropTypes.func.isRequired,
};

export default QuestionsUpload;
