import {atom} from 'nanostores';
import RangeStepper from 'range-stepper';

export const $panelStepper = atom<RangeStepper>(
	new RangeStepper({max: 1, current: 1}),
);

export const panelManager = {
	next() {
		$panelStepper.set($panelStepper.get().next().dup());
	},
	back() {
		$panelStepper.set($panelStepper.get().previous().dup());
	},
	isActive(index: number) {
		return $panelStepper.get().isCurrent(index);
	},
};
