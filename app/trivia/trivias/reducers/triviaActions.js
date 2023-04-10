import * as notification from 'enl-redux/constants/notifConstants';
import * as types from './triviaConstants';

export const fetchAction = items => ({
  type: types.FETCH_TRIVIA_DATA,
  items,
});

export const showDetailAction = item => ({
  type: types.SHOW_DETAIL_TRIVIA,
  item,
});

export const hideDetailAction = {
  type: types.HIDE_DETAIL,
};

export const submitAction = (newData, avatar) => ({
  type: types.SUBMIT_TRIVIA,
  newData,
  avatar
});

export const addAction = {
  type: types.ADD_TRIVIA,
};

export const editAction = item => ({
  type: types.EDIT_TRIVIA,
  item,
});

export const searchAction = keyword => ({
  type: types.SEARCH_TRIVIA,
  keyword,
});

export const removeAction = item => ({
  type: types.DELETE_TRIVIA,
  item,
});

export const closeAction = {
  type: types.CLOSE_TRIVIA_FORM,
};

export const addToFavoriteAction = item => ({
  type: types.TOGGLE_FAVORITE,
  item,
});

export const closeNotifAction = {
  type: notification.CLOSE_NOTIF
};
