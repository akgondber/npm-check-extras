import * as R from 'ramda';
import {action, computed} from 'nanostores';
import {$allItems} from '../store/packages.js';
import {type PackageDetail} from '../types.js';
import {
	activatePackage,
	deactivatePackage,
	getNextIndex,
	getPreviousIndex,
	selectify,
	unselectify,
} from '../helpers.js';
import RU from '../ramda-utils.js';

export const filterPackages = action(
	$allItems,
	'filter',
	(store, input: string) => {
		store.set(store.get().filter(item => item.name.includes(input)));

		return store.get();
	},
);

export const removeSelectedPackagesFromList = action(
	$allItems,
	'removeSelectedPackagesFromList',
	store => {
		store.set(R.reject(RU.isSelected, store.get()));

		return store.get();
	},
);

const activateFirstPackage = action(
	$allItems,
	'activateFirstPackage',
	store => {
		store.set(R.adjust(0, activatePackage, store.get()));
	},
);

const activePackageIndex = computed($allItems, allItems =>
	R.findIndex((item: PackageDetail) => RU.isActive(item), allItems),
);

const activateNextPackage = action($allItems, ' ', store => {
	const allItems = store.get();
	const currentIndex = activePackageIndex.get();
	const targetIndex = getNextIndex(currentIndex, allItems.length);

	let newValue = R.adjust(targetIndex, activatePackage, allItems);

	if (currentIndex !== targetIndex)
		newValue = R.adjust(currentIndex, deactivatePackage, newValue);

	store.set(newValue);
	return store.get();
});

const activatePreviousPackage = action(
	$allItems,
	'activatePreviousPackage',
	store => {
		const allItems = store.get();
		const currentIndex = activePackageIndex.get();
		const targetIndex = getPreviousIndex(currentIndex, allItems.length);

		let newValue = R.adjust(targetIndex, activatePackage, allItems);

		if (currentIndex !== targetIndex)
			newValue = R.adjust(currentIndex, deactivatePackage, newValue);

		store.set(newValue);
		return store.get();
	},
);

const selectPackagesByFilter = action(
	$allItems,
	'selectPackagesByFilter',
	(store, input) => {
		if (R.isEmpty(input)) store.set(R.map(R.nAry(1, selectify), store.get()));
		else {
			const newValue = R.map(
				R.ifElse(
					R.propSatisfies(R.includes(input), 'name'),
					selectify,
					unselectify,
				),
				store.get(),
			);
			store.set(newValue);
		}

		return store.get();
	},
);

const addToSelected = action(
	$allItems,
	'addToSelected',
	(store, packageName) => {
		const foundIndex = R.findIndex(R.propEq(packageName, 'name'), store.get());
		if (foundIndex > -1) {
			store.set(R.adjust(foundIndex, selectify, store.get()));
		}

		return store.get();
	},
);

const removeFromSelected = action(
	$allItems,
	'removeFromSelected',
	(store, packageName) => {
		const foundIndex = R.findIndex(R.propEq(packageName, 'name'), store.get());
		if (foundIndex > -1) {
			store.set(
				R.adjust(
					foundIndex,
					(value: PackageDetail) =>
						R.set(R.lensProp('isSelected'), true, value),
					store.get(),
				),
			);
		}

		return store.get();
	},
);

const toggle = action($allItems, 'toggle', (store, packageName) => {
	const foundIndex = R.findIndex(R.propEq(packageName, 'name'), store.get());
	if (foundIndex > -1) {
		store.set(
			R.adjust(
				foundIndex,
				(value: PackageDetail) =>
					R.over(R.lensProp('isSelected'), R.not, value),
				store.get(),
			),
		);
	}

	return store.get();
});

const toggleActive = action($allItems, 'toggle', store => {
	const foundIndex = activePackageIndex.get();
	if (foundIndex === -1) {
		return;
	}

	store.set(
		R.adjust(
			foundIndex,
			(value: PackageDetail) => R.over(R.lensProp('isSelected'), R.not, value),
			store.get(),
		),
	);

	return store.get();
});

const setActive = action(
	$allItems,
	'setActive',
	(store, packageName: string) => {
		const foundIndex = R.findIndex(R.propEq(packageName, 'name'), store.get());
		if (foundIndex > -1) {
			let previousPackages = store.get();
			previousPackages = R.map(
				R.set(R.lensProp<PackageDetail>('isActive'), false),
				previousPackages,
			);
			store.set(
				R.adjust(
					foundIndex,
					R.set(R.lensProp<PackageDetail>('isActive'), true),
					previousPackages,
				),
			);
		}

		return store.get();
	},
);

export const packagesActions = {
	addToSelected,
	filterPackages,
	removeSelectedPackagesFromList,
	selectPackagesByFilter,
	removeFromSelected,
	toggle,
	toggleActive,
	setActive,
	activateFirstPackage,
	activateNextPackage,
	activatePreviousPackage,
	isSelected: RU.isSelected,
};
