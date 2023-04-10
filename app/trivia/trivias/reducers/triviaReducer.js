import produce from 'immer';
import notif from 'enl-api/ui/notifMessage';
import { CLOSE_NOTIF } from 'enl-redux/constants/notifConstants';
import {
  FETCH_TRIVIA_DATA,
  SEARCH_TRIVIA,
  SHOW_DETAIL_TRIVIA,
  HIDE_DETAIL,
  EDIT_TRIVIA,
  SUBMIT_TRIVIA,
  DELETE_TRIVIA,
  TOGGLE_FAVORITE,
  ADD_TRIVIA,
  CLOSE_TRIVIA_FORM
} from './triviaConstants';

const initialState = {
  triviaList: [],
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
const triviaReducer = (state = initialState, action = {}) => produce(state, draft => {
  switch (action.type) {
    case FETCH_TRIVIA_DATA:
      draft.triviaList = action.items;
      break;
    case SEARCH_TRIVIA: {
      action.keyword.persist();
      const keyword = action.keyword.target.value.toLowerCase();
      draft.keywordValue = keyword;
      break;
    }
    case ADD_TRIVIA:
      draft.openFrm = true;
      draft.formValues = {};
      draft.avatarInit = '';
      break;
    case CLOSE_TRIVIA_FORM:
      draft.openFrm = false;
      draft.formValues = null;
      draft.avatarInit = '';
      draft.notifMsg = notif.discard;
      break;
    case EDIT_TRIVIA: {
      editingIndex = draft.triviaList.findIndex((obj) => obj.key === action.item.key);
      draft.openFrm = true;
      draft.selectedId = action.item.key;
      draft.formValues = action.item;
      draft.avatarInit = action.item.avatar;
      break;
    }
    case SUBMIT_TRIVIA: {
      const initItem = action.newData;
      if (draft.selectedId === action.newData.key) {
        // Update data
        const avatar = action.avatar !== '' ? action.avatar : state.avatarInit;
        const newItem = {
          ...initItem,
          avatar
        };
        draft.triviaList[editingIndex] = newItem;
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
        draft.triviaList.unshift(newItem);
        draft.selectedIndex = 0;
        draft.notifMsg = notif.saved;
      }
      draft.formValues = null;
      draft.avatarInit = '';
      draft.openFrm = false;
      break;
    }
    case SHOW_DETAIL_TRIVIA: {
      const index = state.triviaList.indexOf(action.item);
      draft.selectedIndex = index || 0;
      draft.showMobileDetail = true;
      break;
    }
    case HIDE_DETAIL:
      draft.showMobileDetail = false;
      break;
    case DELETE_TRIVIA: {
      const index = draft.triviaList.findIndex((obj) => obj.key === action.item.key);
      draft.triviaList.splice(index, 1);
      draft.notifMsg = notif.removed;
      break;
    }
    case TOGGLE_FAVORITE: {
      const index = draft.triviaList.findIndex((obj) => obj.key === action.item.key);
      draft.triviaList[index].favorited = !draft.triviaList[index].favorited;
      break;
    }
    case CLOSE_NOTIF:
      draft.notifMsg = '';
      break;
    default:
      break;
  }
});

export default triviaReducer;
