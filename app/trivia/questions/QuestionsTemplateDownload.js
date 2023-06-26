/* eslint-disable no-unsafe-optional-chaining */
import React from 'react';
import axios from 'axios';
import DownloadIcon from '@material-ui/icons/CloudDownloadSharp';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import fileDownload from 'js-file-download';

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

export default function QuestionsTemplateDownload() {
  const classes = useStyles();
  const [csvFile, setCsvFile] = React.useState('');

  const downloadQuestionTemplate = () => {
    axios.get('/api/trivia/questions/template', {
      headers: {
        Authorization: `${
          localStorage.getItem('token')
        }`
      }
    })
      .then(res => {
        console.log(res);
        fileDownload(res.data, 'questions_tpl.tsv');
      })
      .catch(err => {
        console.log(err.message + '\n' + err.response?.data);
      });
  };

  return (
    <div className="container">
      <div className="row">
        <Button className={classes.button} variant="contained" color="secondary" onClick={() => downloadQuestionTemplate()}>
          Download
          <DownloadIcon className={classes.rightIcon}/>
        </Button>
      </div>
    </div>
  );
}
