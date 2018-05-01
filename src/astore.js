import { combineReducers } from 'redux'
//import { combineReducers } from 'redux'
//import todos from './todos'
//import visibilityFilter from './visibilityFilter'
//import userStates from './userStates.js'

function setUserState(state,action){
	switch(action.type){
	case 'login':
		return {
			username : action.username,
			access_token : action.access_token,
		};

	case 'logout':
		return {
			username : null,
			access_token : null,
		};

	default:
		return {};
	}
}

const Astore = combineReducers({
  setUserState,
});

export default Astore;