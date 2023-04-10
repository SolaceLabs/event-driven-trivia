import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import { PapperBlock } from 'enl-components';
import CategoriesForm from './CategoriesForm';

const Transition = React.forwardRef((tprops, ref) => <Slide direction="up" ref={ref} {...tprops} />);

export default function CategoriesModal(props) {
  const {
    data, saveResults, open, closeModal
  } = props;

  const handleClose = () => {
    closeModal();
  };

  return (
    <div>
      <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
        <PapperBlock
          title={'Category'}
          icon="library_books"
          desc={'Manage Category'}
          actionChildren={
            <IconButton edge="start" color="inherit" onClick={closeModal} aria-label="close">
              <CloseIcon />
            </IconButton>
          }
        >
          <div>
            <CategoriesForm data={data} onSubmit={(values) => saveResults(values)} />
          </div>
        </PapperBlock>
      </Dialog>
    </div>
  );
}

CategoriesModal.propTypes = {
  closeModal: PropTypes.func.isRequired
};
