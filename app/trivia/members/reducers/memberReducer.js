import produce from 'immer';
import notif from 'enl-api/ui/notifMessage';
import { CLOSE_NOTIF } from 'enl-redux/constants/notifConstants';
import {
  FETCH_MEMBER_DATA,
  SEARCH_MEMBER,
  SHOW_DETAIL_MEMBER,
  HIDE_DETAIL,
  EDIT_MEMBER,
  SUBMIT_MEMBER,
  DELETE_MEMBER,
  TOGGLE_FAVORITE,
  ADD_MEMBER,
  CLOSE_MEMBER_FORM
} from './categoryConstants';

const initialState = {
  categoryList: [],
  formValues: null,
  selectedIndex: 0,
  selectedId: '',
  keywordValue: '',
  avatarInit: '',
  openFrm: false,
  showMobileDetail: false,
  notifMsg: '',
};
let editingIndex = 0;

/* eslint-disable default-case, no-param-reassign */
const categoryReducer = (state = initialState, action = {}) => produce(state, draft => {
  switch (action.type) {
    case FETCH_MEMBER_DATA:
      draft.categoryList = action.items;
      break;
    case SEARCH_MEMBER: {
      action.keyword.persist();
      const keyword = action.keyword.target.value.toLowerCase();
      draft.keywordValue = keyword;
      break;
    }
    case ADD_MEMBER:
      draft.openFrm = true;
      draft.formValues = {};
      draft.avatarInit = '';
      break;
    case CLOSE_MEMBER_FORM:
      draft.openFrm = false;
      draft.formValues = null;
      draft.avatarInit = '';
      draft.notifMsg = notif.discard;
      break;
    case EDIT_MEMBER: {
      editingIndex = draft.categoryList.findIndex((obj) => obj.key === action.item.key);
      draft.openFrm = true;
      draft.selectedId = action.item.key;
      draft.formValues = action.item;
      draft.avatarInit = action.item.avatar;
      break;
    }
    case SUBMIT_MEMBER: {
      const initItem = action.newData;
      if (draft.selectedId === action.newData.key) {
        // Update data
        const avatar = action.avatar !== '' ? action.avatar : state.avatarInit;
        const newItem = {
          ...initItem,
          avatar
        };
        draft.categoryList[editingIndex] = newItem;
        draft.notifMsg = notif.updated;
      } else {
        // Insert data
        const avatar = action.avatar !== '' ? action.avatar : '/images/pp_boy.svg';
        const key = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
        const newItem = {
          ...initItem,
          key,
          avatar,
          favorited: false
        };
        draft.categoryList.unshift(newItem);
        draft.selectedIndex = 0;
        draft.notifMsg = notif.saved;
      }
      draft.formValues = null;
      draft.avatarInit = '';
      draft.openFrm = false;
      break;
    }
    case SHOW_DETAIL_MEMBER: {
      const index = state.categoryList.indexOf(action.item);
      draft.selectedIndex = index || 0;
      draft.showMobileDetail = true;
      break;
    }
    case HIDE_DETAIL:
      draft.showMobileDetail = false;
      break;
    case DELETE_MEMBER: {
      const index = draft.categoryList.findIndex((obj) => obj.key === action.item.key);
      draft.categoryList.splice(index, 1);
      draft.notifMsg = notif.removed;
      break;
    }
    case TOGGLE_FAVORITE: {
      const index = draft.categoryList.findIndex((obj) => obj.key === action.item.key);
      draft.categoryList[index].favorited = !draft.categoryList[index].favorited;
      break;
    }
    case CLOSE_NOTIF:
      draft.notifMsg = '';
      break;
    default:
      break;
  }
});

export default categoryReducer;
