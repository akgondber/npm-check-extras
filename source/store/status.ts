import * as R from 'ramda';
import {map, action, type MapStore, computed} from 'nanostores';
import ramdaUtils from '../ramda-utils.js';

const statuses = {
	fethcing: 'FETCHING',
	waiting: 'WAITING',
	done: 'DONE',
	failed: 'FAILED',
	info: 'INFO',
	travel: 'TRAVEL',
} as const;

type AppStatus = (typeof statuses)[keyof typeof statuses];

type ActionStatus = {
	status: AppStatus;
	text: string;
};

export const statusToMessage = R.zipObj(Object.values(statuses), [
	'Checking dependencies, please wait a little bit',
	'Set up desired options',
	'Packages were inspected, check out the results',
	'Some error occured while checking dependencies',
	'Displaying information',
	'Reverting packages entries to specific point',
]);

export const $status = map<ActionStatus>({
	status: statuses.waiting,
	text: statusToMessage[statuses.waiting],
});

const setIfDiffers = (store: MapStore<ActionStatus>, newValue: AppStatus) => {
	if (store.get().status !== newValue) {
		store.set({
			status: newValue,
			text: statusToMessage[newValue],
		});
	}
};

const isDoneStatus = computed($status, status =>
	ramdaUtils.isDoneStatus(status),
);
const isFailedStatus = computed($status, status =>
	ramdaUtils.isFailedStatus(status),
);
const isInfoStatus = computed($status, status =>
	ramdaUtils.isInfoStatus(status),
);
const isTraveloStatus = computed($status, status =>
	ramdaUtils.isTravelStatus(status),
);
const isWaitingStatus = computed($status, status =>
	ramdaUtils.isWaitingStatus(status),
);

export const statusesManager = {
	setFetching: action($status, 'setFetching', store => {
		setIfDiffers(store, statuses.fethcing);
	}),
	isFetching() {
		return ramdaUtils.isFetchingStatus($status.get());
	},
	isDone() {
		return isDoneStatus.get();
	},
	isFailed() {
		return isFailedStatus.get();
	},
	isInfo() {
		return isInfoStatus.get();
	},
	isTravel() {
		return isTraveloStatus.get();
	},
	isWaiting() {
		return isWaitingStatus.get();
	},
	setWaiting: action($status, 'setWaiting', store => {
		setIfDiffers(store, statuses.waiting);
	}),
	setInfo: action($status, 'setInfo', store => {
		setIfDiffers(store, statuses.info);
	}),
	setTravel: action($status, 'setTravel', store => {
		setIfDiffers(store, statuses.travel);
	}),
	setDone: action($status, 'setDone', store => {
		setIfDiffers(store, statuses.done);
	}),
	setFailed: action($status, 'setFailed', store => {
		setIfDiffers(store, statuses.failed);
	}),
};

export const setStatusText = action(
	$status,
	'setStatusText',
	(store, newValue: string) => {
		store.setKey('text', newValue);

		return store.get();
	},
);
