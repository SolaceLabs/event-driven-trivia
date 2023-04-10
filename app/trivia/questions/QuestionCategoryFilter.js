import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';
import TriviaWrapper from 'enl-api/trivia/TriviaWrapper';

const styles = theme => ({
  items: {
    overflow: 'hidden'
  },
  item: {
    float: 'left',
    width: '50%',
    color: '#000000de',
    padding: '5px'
  }
});

function QuestionCategoryFilter(props) {
  const {
    onCancel,
    onSubmit,
    categories,
    filterList,
    classes
  } = props;

  const [open, setOpen] = React.useState(true);
  const [scroll, setScroll] = React.useState('paper');
  const [inputState, setInputState] = useState({});

  useEffect(async () => {
    const initialState = {};
    filterList.forEach(filter => {
      initialState[filter] = true;
    });
    setInputState(initialState);
  }, []);

  const handleSelectionChange = name => event => {
    setInputState({
      ...inputState,
      [name]: event.target.checked
    });
  };

  const submitFilters = () => {
    setOpen(false);
    const filters = Object.entries(inputState).filter((entry) => entry[1]).map(v => v[0]);
    onSubmit(filters);
  };

  const cancelFilters = () => {
    setOpen(false);
    onCancel([]);
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={cancelFilters}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Question Categories</DialogTitle>
        <DialogContent dividers={scroll === 'paper'}>
          <DialogContentText
            id="scroll-dialog-description"
            tabIndex={-1}
          >
            <FormControl component="fieldset">
              <FormGroup>
                <div className={classes.items}>
                  {categories.map((cat) => (
                    <FormControlLabel
                      control={(
                        <Checkbox
                          checked={inputState[cat.name]}
                          onChange={handleSelectionChange(cat.name)}
                          value={cat.name}
                        />
                      )}
                      label={`${cat.name} [${cat.no_of_questions}]`}
                    />

                    // <div id={cat._id} className={classes.item}>
                    //   <Checkbox
                    //     checked={cat._id}
                    //     onChange={handleSelectionChange(cat._id)}
                    //     value={cat._id}
                    //   />
                    //   {`${cat.name} [${cat.no_of_questions}]`}
                    // </div>
                  ))}
                </div>
              </FormGroup>
            </FormControl>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelFilters} color="primary">
            Cancel
          </Button>
          <Button onClick={submitFilters} color="primary">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default withStyles(styles)(QuestionCategoryFilter);
