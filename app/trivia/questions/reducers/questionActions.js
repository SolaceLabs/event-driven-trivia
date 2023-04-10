import * as notification from 'enl-redux/constants/notifConstants';
import * as types from './questionConstants';

export const fetchAction = items => ({
  type: types.FETCH_QUESTION_DATA,
  items,
});

export const showDetailAction = item => ({
  type: types.SHOW_DETAIL_QUESTION,
  item,
});

export const hideDetailAction = {
  type: types.HIDE_DETAIL,
};

export const submitAction = (newData, avatar) => ({
  type: types.SUBMIT_QUESTION,
  newData,
  avatar
});

export const addAction = {
  type: types.ADD_QUESTION,
};

export const editAction = item => ({
  type: types.EDIT_QUESTION,
  item,
});

export const searchAction = keyword => ({
  type: types.SEARCH_QUESTION,
  keyword,
});

export const removeAction = item => ({
  type: types.DELETE_QUESTION,
  item,
});

export const closeAction = {
  type: types.CLOSE_QUESTION_FORM,
};

export const addToFavoriteAction = item => ({
  type: types.TOGGLE_FAVORITE,
  item,
});

export const closeNotifAction = {
  type: notification.CLOSE_NOTIF
};
