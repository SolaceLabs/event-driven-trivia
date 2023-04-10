import produce from 'immer';
import notif from 'enl-api/ui/notifMessage';
import { CLOSE_NOTIF } from 'enl-redux/constants/notifConstants';
import {
  FETCH_QUESTION_DATA,
  SEARCH_QUESTION,
  SHOW_DETAIL_QUESTION,
  HIDE_DETAIL,
  EDIT_QUESTION,
  SUBMIT_QUESTION,
  DELETE_QUESTION,
  TOGGLE_FAVORITE,
  ADD_QUESTION,
  CLOSE_QUESTION_FORM
} from './questionConstants';

const initialState = {
  questionList: [],
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
const questionReducer = (state = initialState, action = {}) => produce(state, draft => {
  switch (action.type) {
    case FETCH_QUESTION_DATA:
      draft.questionList = action.items;
      break;
    case SEARCH_QUESTION: {
      action.keyword.persist();
      const keyword = action.keyword.target.value.toLowerCase();
      draft.keywordValue = keyword;
      break;
    }
    case ADD_QUESTION:
      draft.openFrm = true;
      draft.formValues = {};
      draft.avatarInit = '';
      break;
    case CLOSE_QUESTION_FORM:
      draft.openFrm = false;
      draft.formValues = null;
      draft.avatarInit = '';
      draft.notifMsg = notif.discard;
      break;
    case EDIT_QUESTION: {
      editingIndex = draft.questionList.findIndex((obj) => obj.key === action.item.key);
      draft.openFrm = true;
      draft.selectedId = action.item.key;
      draft.formValues = action.item;
      draft.avatarInit = action.item.avatar;
      break;
    }
    case SUBMIT_QUESTION: {
      const initItem = action.newData;
      if (draft.selectedId === action.newData.key) {
        // Update data
        const avatar = action.avatar !== '' ? action.avatar : state.avatarInit;
        const newItem = {
          ...initItem,
          avatar
        };
        draft.questionList[editingIndex] = newItem;
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
        draft.questionList.unshift(newItem);
        draft.selectedIndex = 0;
        draft.notifMsg = notif.saved;
      }
      draft.formValues = null;
      draft.avatarInit = '';
      draft.openFrm = false;
      break;
    }
    case SHOW_DETAIL_QUESTION: {
      const index = state.questionList.indexOf(action.item);
      draft.selectedIndex = index || 0;
      draft.showMobileDetail = true;
      break;
    }
    case HIDE_DETAIL:
      draft.showMobileDetail = false;
      break;
    case DELETE_QUESTION: {
      const index = draft.questionList.findIndex((obj) => obj.key === action.item.key);
      draft.questionList.splice(index, 1);
      draft.notifMsg = notif.removed;
      break;
    }
    case TOGGLE_FAVORITE: {
      const index = draft.questionList.findIndex((obj) => obj.key === action.item.key);
      draft.questionList[index].favorited = !draft.questionList[index].favorited;
      break;
    }
    case CLOSE_NOTIF:
      draft.notifMsg = '';
      break;
    default:
      break;
  }
});

export default questionReducer;
