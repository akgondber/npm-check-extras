import * as R from 'ramda';
import {action} from 'nanostores';
import {$selectedOptionsIndexes} from '../store/options.js';
import {$availableActions} from '../store.js';

export const addToSelected = action(
	$selectedOptionsIndexes,
	'addToSelected',
	(store, index: number) => {
		if (!R.includes(index, store.get())) {
			$selectedOptionsIndexes.set(R.append(index, store.get()));
		}

		return store.get();
	},
);

export const isSelected = action(
	$availableActions,
	'isSelected',
	(store, option: string) => {
		return R.any(R.pathEq(option, ['value', 'name']))(store.get());
	},
);
