import * as R from 'ramda';

type Fn = (item: any) => any;

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
const notEquals = (a: string) => (b: string) => R.not(R.equals(a, b));
const flipIncludes = R.flip(R.includes);
const getIndex = (foundIndex: number): number =>
	foundIndex > -1 ? 0 : foundIndex;
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
	flipIncludes,
	getIndex,
	adjustAll,
	pathIncludes,
};

export default ramdaUtils;
