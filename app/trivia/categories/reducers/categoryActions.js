import * as notification from 'enl-redux/constants/notifConstants';
import * as types from './categoryConstants';

export const fetchAction = items => ({
  type: types.FETCH_CATEGORY_DATA,
  items,
});

export const showDetailAction = item => ({
  type: types.SHOW_DETAIL_CATEGORY,
  item,
});

export const hideDetailAction = {
  type: types.HIDE_DETAIL,
};

export const submitAction = (newData, avatar) => ({
  type: types.SUBMIT_CATEGORY,
  newData,
  avatar
});

export const addAction = {
  type: types.ADD_CATEGORY,
};

export const editAction = item => ({
  type: types.EDIT_CATEGORY,
  item,
});

export const searchAction = keyword => ({
  type: types.SEARCH_CATEGORY,
  keyword,
});

export const removeAction = item => ({
  type: types.DELETE_CATEGORY,
  item,
});

export const closeAction = {
  type: types.CLOSE_CATEGORY_FORM,
};

export const addToFavoriteAction = item => ({
  type: types.TOGGLE_FAVORITE,
  item,
});

export const closeNotifAction = {
  type: notification.CLOSE_NOTIF
};
