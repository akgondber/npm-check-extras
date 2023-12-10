import * as R from 'ramda';

const eqWaiting = R.equals('WAITING');
const eqRunning = R.equals('RUNNING');
const eqSuccess = R.equals('SUCCESS');
const eqFailed = R.equals('FAILED');
const isActive = R.propEq(true, 'isActive');
const isSelected = R.propEq(true, 'isSelected');
const isFetchingStatus = R.propEq('FETCHING', 'status');
const isDoneStatus = R.propEq('DONE', 'status');
const isFailedStatus = R.propEq('FAILED', 'status');
const notEquals = (a: string) => (b: string) => R.not(R.equals(a, b));
const flipIncludes = R.flip(R.includes);
const getIndex = (foundIndex: number): number =>
	foundIndex > -1 ? 0 : foundIndex;

const ramdaUtils = {
	eqWaiting,
	eqRunning,
	eqSuccess,
	eqFailed,
	isActive,
	isSelected,
	notEquals,
	isFetchingStatus,
	isDoneStatus,
	isFailedStatus,
	flipIncludes,
	getIndex,
};

export default ramdaUtils;
