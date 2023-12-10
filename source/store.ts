import {atom, computed} from 'nanostores';
import * as R from 'ramda';
import {type Action} from './types.js';
import {availableActions} from './defaults.js';

export const $availableActions = atom<Action[]>(
	availableActions.map((action, i) => ({
		id: R.inc(i),
		value: action,
		isActive: R.equals(action.name, 'store-history'),
		isSelected: false,
	})),
);

export const $selectedActions = computed(
	$availableActions,
	availableActions => {
		return R.filter(R.propEq(true, 'isSelected'), availableActions);
	},
);
