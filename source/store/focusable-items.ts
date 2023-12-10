import * as R from 'ramda';
import {atom, action} from 'nanostores';
import RangeStepper from 'range-stepper';
import {type FocusableItem} from '../types.js';
import {activate, deactivate} from '../helpers.js';
import ramdaUtils from '../ramda-utils.js';

export const $focusableItems = atom<FocusableItem[]>([
	{
		id: 1,
		name: 'options-panel',
		kind: 'panel',
		isActive: true,
	},
	{
		id: 2,
		name: 'check-packages',
		kind: 'button',
		isActive: true,
	},
	{
		id: 3,
		name: 'packages-panel',
		kind: 'panel',
		isActive: false,
	},
	{
		id: 4,
		name: 'filter-input',
		kind: 'input',
		isActive: false,
	},
	{
		id: 5,
		name: 'update',
		kind: 'button',
		isActive: false,
	},
]);

const activateByName = action(
	$focusableItems,
	'activateByName',
	(store, name: string) => {
		const items = store.get();
		const foundIndex = R.findIndex(R.propEq(name, 'name'), items);

		if (foundIndex > -1) {
			const item = R.nth(foundIndex, items)!;
			const idsToActivate = [item.id];
			if (item.kind === 'panel') {
				const firstItemInsidePanel = findFirstItemBelongingToPanel(name);

				if (firstItemInsidePanel) {
					idsToActivate.push(firstItemInsidePanel.id);
				}
			}

			// Const predicate = item.kind === 'panel' ? R.whereAny({ id: R.equals() })
			store.set(
				R.map(
					R.ifElse(
						R.where({id: R.flip(R.includes)(idsToActivate)}),
						activate,
						deactivate,
					),
					items,
				),
			);
		}

		return store.get();
	},
);

const deactivateByName = action(
	$focusableItems,
	'deactivateByName',
	(store, name: string) => {
		const items = store.get();
		const foundIndex = R.findIndex(R.propEq(name, 'name'), items);

		if (foundIndex > -1) {
			store.set(
				R.map(R.ifElse(R.propEq(name, 'name'), deactivate, activate), items),
			);
		}

		return store.get();
	},
);

const findById = action(
	$focusableItems,
	'findById',
	(store, id: number): FocusableItem => {
		const buttons = store.get();
		const foundIndex = R.findIndex(R.propEq(id, 'id'), buttons);

		if (foundIndex === -1) {
			throw new Error('Item with this id was not found');
		}

		return buttons[foundIndex]!;
	},
);

const findByName = action(
	$focusableItems,
	'findByName',
	(store, name: string) => {
		const buttons = store.get();
		const foundIndex = R.findIndex(R.propEq(name, 'name'), buttons);

		return foundIndex > -1 ? buttons[foundIndex] : undefined;
	},
);

const isActive = (name: string) => {
	const focusableItems = $focusableItems.get();
	return R.any(
		R.both<FocusableItem[]>(R.propEq(true, 'isActive'), R.propEq(name, 'name')),
		focusableItems,
	);
};

const isPanelActive = (name: string) => {
	const panelItem = findByName(name);
	if (!panelItem) {
		return false;
	}

	return panelItem.isActive;
};

const isPanelActiveButButtonNot = (panelName: string, buttonName: string) => {
	const panel = findByName(panelName);
	if (!panel) return false;
	if (!panel.isActive) return false;

	const button = findByName(buttonName);
	if (button) return !button.isActive;

	return false;
};

const isPanelOrBelongingItemsActive = (name: string) => {
	const focusableItems = $focusableItems.get();
	const panelItem = findByName(name);
	if (!panelItem) {
		return false;
	}

	if (panelItem.isActive) {
		return true;
	}

	const belongingItems = R.filter(
		R.propSatisfies(R.gt(panelItem.id), 'id'),
		focusableItems,
	);
	const internalItems = R.takeWhile(
		R.compose(R.not, R.propEq('panel', 'kind')),
		belongingItems,
	);
	return R.any(ramdaUtils.isActive, internalItems);
};

const nameEq = R.curry((name: string, checkable: FocusableItem) =>
	R.propEq(name, 'name', checkable),
);

const belongsToPanel = (name: string, panelName: string) => {
	const focusableItems = $focusableItems.get();
	const checkablePanel = R.find(nameEq(panelName), focusableItems);

	if (!checkablePanel) return false;

	const checkableItem = R.find(R.propEq(name, 'name'), focusableItems);

	if (!checkableItem) return false;

	const followingByPanel = R.find(
		R.both(
			R.propSatisfies(R.gt(checkablePanel.id), 'id'),
			R.propEq('panel', 'kind'),
		),
		focusableItems,
	);
	if (followingByPanel) {
		return R.propSatisfies(
			R.both(R.lt(checkablePanel.id), R.gt(followingByPanel.id)),
			'id',
		)(checkableItem);
	}

	return !checkablePanel.isActive && checkableItem.id > checkablePanel.id;
};

const activateNext = action($focusableItems, 'activateNext', store => {
	const focusableItems = store.get();
	const activeItems = R.filter(R.propEq(true, 'isActive'), focusableItems);
	const currentFocusedItem = R.reduce(
		R.maxBy(R.propOr(0, 'id')),
		R.head(activeItems),
		activeItems,
	);

	const ids = R.pluck('id', focusableItems);
	const minId = R.reduce(R.min, Number.POSITIVE_INFINITY, ids) as number;
	const maxId = R.reduce(R.max, Number.NEGATIVE_INFINITY, ids) as number;
	const current = R.dec(
		R.isNil(currentFocusedItem) ? maxId : currentFocusedItem.id,
	);

	const stepper = new RangeStepper({
		min: R.dec(minId),
		max: R.dec(maxId),
		current,
	});
	const idToActivate = R.inc(stepper.next().dup().value);
	const target = findById(idToActivate);
	const fir = findFirstItemBelongingToPanel(target.name);
	const idsToActivate = [target.id];
	if (R.isNotNil(fir)) {
		idsToActivate.push(fir.id);
	}

	store.set(
		R.map(
			R.ifElse(
				R.where({id: R.flip(R.includes)(idsToActivate)}),
				activate,
				(f: FocusableItem) =>
					R.propSatisfies(ramdaUtils.notEquals('panel'), 'kind', target) &&
					R.propEq('panel', 'kind', f) &&
					f.isActive
						? R.identity(f)
						: deactivate(f),
			),
			focusableItems,
		),
	);
	return store.get();
});

const findFirstItemBelongingToPanel = (panelName: string) => {
	const panel = findByName(panelName);
	const focusableItems = $focusableItems.get();

	if (panel) {
		const nextPanel = R.find(
			R.where({id: R.lt(panel.id), kind: R.equals('panel')}),
			focusableItems,
		);
		// Const panelItems = R.filter(R.propSatisfies(R.gt(panel.id), R.sortBy(R.prop('id'), );
		const firstPanelItem = R.isNil(nextPanel)
			? R.find(
					R.where({id: R.lt(panel.id), kind: R.equals('button')}),
					focusableItems,
				)
			: R.find(
					R.where({
						id: R.both(R.lt(panel.id), R.gt(nextPanel.id)),
						kind: R.equals('button'),
					}),
					focusableItems,
				);

		return firstPanelItem;
	}

	return null;
};

export const focusableItemsManager = {
	activateByName,
	deactivateByName,
	isActive,
	isPanelActive,
	isPanelActiveButButtonNot,
	isPanelOrBelongingItemsActive,
	belongsToPanel,
	activateNext,
	findById,
	findByName,
};
