import {atom, action} from 'nanostores';
import * as R from 'ramda';
import {type ActionItem, type Action} from '../types.js';
import {$availableActions} from '../store.js';
import {
	activateOptionItem,
	deactivateOptionItem,
	selectAction,
	unselectAction,
} from '../helpers.js';
import RU from '../ramda-utils.js';
import {
	$allItems,
	clearPackages,
	getUpdateCandidatePackages,
} from './packages.js';
import {$optionsStepper} from './options-stepper.js';

export const $selectedOptionsIndexes = atom<number[]>([]);

export const isSelected = action(
	$selectedOptionsIndexes,
	'isSelected',
	(store, item: number) => {
		return R.includes(item, store.get());
	},
);

export const addToSelected = action(
	$selectedOptionsIndexes,
	'addToSelected',
	(store, index: number) => {
		if (!R.includes(index, store.get())) {
			$selectedOptionsIndexes.set(R.append(index, store.get()));
		}

		return store.get();
	},
);

const namePath = ['value', 'name'];
const mainCompetings = ['production', 'dev-only', 'global'];
const getCompetingOptions = (subject: string): string[] => {
	return R.cond([
		[R.equals('global'), R.always(R.append('skip-unused', mainCompetings))],
		[R.equals('skip-unused'), R.always(['global', 'skip-unused'])],
		[RU.flipIncludes(mainCompetings), R.always(mainCompetings)],
		[R.T, R.always([])],
	])(subject);
};

const removeFromSelected = action(
	$selectedOptionsIndexes,
	'removeFromSelected',
	(store, item: number) => {
		if (R.includes(item, store.get())) {
			store.set(R.reject(R.equals(item), store.get()));
		}

		return store.get();
	},
);

export const toggle = action(
	$selectedOptionsIndexes,
	'toggle',
	(store, item: number) => {
		if (R.includes(item, store.get())) {
			store.set(R.reject(R.equals(item), store.get()));
		} else {
			store.set(R.append(item, store.get()));
		}

		return store.get();
	},
);

export async function fetchPackages() {
	clearPackages();
	const packages = await getUpdateCandidatePackages();
	$allItems.set(packages);
}

const findNext = (sourceId: number): Action => {
	const items = $availableActions.get();

	if (R.any(R.propEq(sourceId, 'id'), items)) {
		const sorted = R.sortBy(R.prop('id'), items);
		const index = R.findIndex(R.propEq(sourceId, 'id'), sorted);
		const nextIndex = R.when(
			R.equals(sorted.length),
			R.subtract(sorted.length),
		)(R.inc(index));

		return R.nth(nextIndex, items)!;
	}

	return R.head(items)!;
};

const findPrevious = (sourceId: number): Action => {
	const items = $availableActions.get();

	if (R.any(R.propEq(sourceId, 'id'), items)) {
		const sorted = R.sortBy(R.prop('id'), items);
		const index = R.findIndex(R.propEq(sourceId, 'id'), sorted);

		const previousIndex = R.when(
			R.equals(-1),
			R.add(sorted.length),
		)(R.dec(index));

		return R.nth(previousIndex, items)!;
	}

	return R.head(items)!;
};

const getSelectUnselect = (source: string, list: string[]) =>
	R.map(
		(item: string) => (R.equals(source, item) ? selectAction : unselectAction),
		list,
	);

export const optionsManager = {
	selectItem(item: ActionItem) {
		const found = R.findIndex(R.propEq(item, 'value'), $availableActions.get());
		const selectedOptionsIndexes = $selectedOptionsIndexes.get();

		if (found > -1 && !R.includes(found, selectedOptionsIndexes)) {
			$selectedOptionsIndexes.set(R.append(found, selectedOptionsIndexes));
		}
	},
	selectByName(optionName: string) {
		const availableActions = $availableActions.get();
		const targetIndex = R.findIndex(
			R.pathEq(optionName, namePath),
			availableActions,
		);
		$availableActions.set(
			R.adjust(
				targetIndex,
				R.set(R.lensProp<Action>('isSelected'), true),
				availableActions,
			),
		);
	},
	activateByName(optionName: string) {
		const availableActions = $availableActions.get();
		const targetOption = R.find(
			R.pathEq(optionName, namePath),
			availableActions,
		);

		if (targetOption) {
			$availableActions.set(
				R.map(
					R.ifElse(
						R.equals(targetOption),
						activateOptionItem,
						deactivateOptionItem,
					),
					availableActions,
				),
			);
		}
	},
	activateNextOption() {
		const availableActions = $availableActions.get();
		const currentActive = R.find(
			R.pathEq(true, ['isActive']),
			availableActions,
		);
		const nextOption = findNext(currentActive ? currentActive.id : -1);
		$availableActions.set(
			R.map(
				R.ifElse(
					R.equals(nextOption),
					activateOptionItem,
					deactivateOptionItem,
				),
				availableActions,
			),
		);
	},
	activatePreviousOption() {
		const availableActions = $availableActions.get();
		const currentActive = R.find(
			R.pathEq(true, ['isActive']),
			availableActions,
		);
		const previousOption = findPrevious(currentActive ? currentActive.id : 1);
		$availableActions.set(
			R.map(
				R.ifElse(
					R.equals(previousOption),
					activateOptionItem,
					deactivateOptionItem,
				),
				availableActions,
			),
		);
	},
	addToSelected() {
		const optionsStepper = $optionsStepper.get();
		addToSelected(optionsStepper.value);
	},
	removeFromSelected() {
		const optionsStepper = $optionsStepper.get();
		removeFromSelected(optionsStepper.value);
	},
	selectWithChecks(value: string) {
		const availableActions = $availableActions.get();
		const indexOfValue = (optionName: string) =>
			R.findIndex(R.pathEq(optionName, namePath), availableActions);

		const competingOptions = getCompetingOptions(value);
		if (!R.isEmpty(competingOptions)) {
			$availableActions.set(
				RU.adjustAll(
					R.map(R.nAry(1, indexOfValue), competingOptions),
					getSelectUnselect(value, competingOptions),
					availableActions,
				) as Action[],
			);
		}

		return $availableActions.get();
	},
	toggle() {
		const availableActions = $availableActions.get();
		const indexOfValue = (optionName: string) =>
			R.findIndex(R.pathEq(optionName, namePath), availableActions);

		const currentOption = R.find(
			R.pathEq(true, ['isActive']),
			availableActions,
		);

		if (R.isNil(currentOption)) {
			return $availableActions.get();
		}

		const currentOptionIndex = R.findIndex(
			R.propEq(currentOption.id, 'id'),
			availableActions,
		);
		const currentSubject = R.path(namePath, currentOption) as string;
		const competingOptions: string[] = R.cond([
			[R.equals('global'), R.always(R.append('skip-unused', mainCompetings))],
			[R.equals('skip-unused'), R.always(['global', 'skip-unused'])],
			[R.T, R.always(mainCompetings)],
		])(currentSubject);

		if (
			!R.includes(currentSubject, competingOptions) ||
			R.propEq(true, 'isSelected', currentOption) ||
			R.all(curr =>
				R.propEq(
					false,
					'isSelected',
					R.find(R.pathEq(curr, namePath), availableActions)!,
				),
			)(competingOptions)
		) {
			$availableActions.set(
				R.adjust(
					currentOptionIndex,
					R.over(R.lensProp<Action>('isSelected'), R.not),
					availableActions,
				),
			);
			return $availableActions.get();
		}

		$availableActions.set(
			RU.adjustAll(
				R.map(R.nAry(1, indexOfValue), competingOptions),
				getSelectUnselect(currentSubject, competingOptions),
				availableActions,
			) as Action[],
		);

		return $availableActions.get();
	},
	isSelected(index: number) {
		return R.view(R.lensPath([index, 'isSelected']), $availableActions.get());
	},
	isSelectedByName(optionName: string) {
		return R.any(
			R.both(
				R.pathEq(optionName, ['value', 'name']),
				R.propEq(true, 'isSelected'),
			),
			$availableActions.get(),
		);
	},
};
