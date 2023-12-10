import * as R from 'ramda';
import {atom} from 'nanostores';
import RangeStepper from 'range-stepper';
import {availableActions} from '../defaults.js';

export const $optionsStepper = atom<RangeStepper>(
	new RangeStepper({max: R.dec(availableActions.length)}),
);

export const optionsStepperManager = {
	next() {
		$optionsStepper.set($optionsStepper.get().next().dup());
	},
	back() {
		$optionsStepper.set($optionsStepper.get().previous().dup());
	},
};
