/* eslint-disable no-unsafe-optional-chaining */
import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import UploadIcon from '@material-ui/icons/CloudUploadSharp';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
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
  },
  fieldBasic: {
    width: '100%',
    marginBottom: 20,
    marginTop: 10
  },
  inlineWrap: {
    display: 'flex',
    flexDirection: 'row'
  },

}));

function CategoriesUpload(props) {
  const { updateResult } = props;
  const classes = useStyles();
  const [csvFile, setCsvFile] = React.useState('');
  const [createCategory, setCreateCategory] = React.useState(false);
  const config = {
    headers: {
      Authorization: `${
        localStorage.getItem('token')
      }`
    },
    csvFile,
  };

  const handleChange = () => {
    setCreateCategory(!createCategory);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('csvFile', csvFile);
    axios.post('/api/trivia/categories/upload', formData, config)
      .then(res => {
        console.log(res);
        updateResult('success', 'New categories upload successful');
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
          <div className={classes.fieldBasic}>
            <FormControlLabel
              control={(
                <Switch
                  checked={createCategory}
                  onChange={handleChange}
                  value="create_category"
                />
              )}
              label="Create Category"
            />
          </div>
          <div className={classes.fieldBasic}>
            <div className="form-group">
              <input type="file" onChange={(e) => setCsvFile(e.target.files[0])} />
            </div>
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

CategoriesUpload.propTypes = {
  forceUpdate: PropTypes.func.isRequired,
};

export default CategoriesUpload;
