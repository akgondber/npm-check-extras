import * as R from 'ramda';

type Fn = (item: any) => any;

const oAry = R.nAry(1);
const eqWaiting = R.equals('WAITING');
const eqRunning = R.equals('RUNNING');
const eqSuccess = R.equals('SUCCESS');
const eqFailed = R.equals('FAILED');
const isActive = R.propEq(true, 'isActive');
const isSelected = R.propEq(true, 'isSelected');
const isFetchingStatus = R.propEq('FETCHING', 'status');
const isDoneStatus = R.propEq('DONE', 'status');
const isFailedStatus = R.propEq('FAILED', 'status');
const isInfoStatus = R.propEq('INFO', 'status');
const isTravelStatus = R.propEq('TRAVEL', 'status');
const isWaitingStatus = R.propEq('WAITING', 'status');
const oIsSelected = oAry(isSelected);
const oIsActive = oAry(isActive);
const notEquals = (a: string) => (b: string) => R.not(R.equals(a, b));
const flipIncludes = R.flip(R.includes);
const getIndex = (foundIndex: number): number =>
	foundIndex > -1 ? 0 : foundIndex;
const isApla = (index: number) => index > -1;
const adjustAll = (indexes: number[], functions: Fn[], source: any[]) => {
	let result = source;
	R.addIndex(R.map)((current: unknown, i: number) => {
		result = R.adjust(
			current as number,
			(item: any) => functions[i]!(item), // eslint-disable-line @typescript-eslint/no-unsafe-return
			result,
		);
	}, indexes);

	return result; // eslint-disable-line @typescript-eslint/no-unsafe-return
};

const pathIncludes = R.curry((items: any[], path: string[], value: any) =>
	R.any((item: any) => R.pathEq(item, path, value), items),
);

const appearanceCount = (value: string, items: string[]): number => {
	return R.count(R.equals(value), items);
};

const aCount = (value: string, items: string[]): number => {
	return appearanceCount(value, items);
};

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
	isInfoStatus,
	isTravelStatus,
	isWaitingStatus,
	oIsSelected,
	oIsActive,
	flipIncludes,
	getIndex,
	isApla,
	adjustAll,
	pathIncludes,
	aCount,
	oAry,
};

export default ramdaUtils;
