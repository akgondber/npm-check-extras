import {computed} from 'nanostores';
import * as R from 'ramda';
import RU from '../ramda-utils.js';
import {$availableActions} from '../store.js';

const $submitButtonText = computed(
	$availableActions,
	(availableActions): string => {
		const found = R.find(RU.oAry(RU.isSelected), availableActions);
		if (found !== null) {
			const targetName = found?.value.name;
			if (R.equals(targetName, 'show-history')) {
				return 'Show history';
			}

			if (targetName === 'revert-updates') {
				return 'Show date points to revert';
			}
		}

		return 'Check dependencies';
	},
);

export const optionsSelectors = {
	submitButtonText: $submitButtonText,
};
