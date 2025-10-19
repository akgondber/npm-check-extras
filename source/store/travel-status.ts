import {action, atom, type WritableStore} from 'nanostores';
import type {TravelStatus, TravelStatusesManager} from '../types.js';

export const $travelStatus = atom<TravelStatus>('WAITING');

const setIfDiffers = (
	store: WritableStore<TravelStatus>,
	newValue: TravelStatus,
) => {
	if (store.get() !== newValue) {
		store.set(newValue);
	}
};

export const travelStatusesManager: TravelStatusesManager = {
	setWaiting: action($travelStatus, 'setWaiting', store => {
		setIfDiffers(store, 'WAITING');
	}),
	setSucceeded: action($travelStatus, 'setSucceeded', store => {
		setIfDiffers(store, 'SUCCEEDED');
	}),
	setFailed: action($travelStatus, 'setFailed', store => {
		setIfDiffers(store, 'FAILED');
	}),
};
