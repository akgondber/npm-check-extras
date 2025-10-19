import * as R from 'ramda';
import {atom, action} from 'nanostores';
import RangeStepper from 'range-stepper';
import type {Activable, OperationItem, Selectable} from '../types.js';
import {getHistoryJson} from '../history.js';
import RU from '../ramda-utils.js';

export type TravelSelectOption = Selectable &
	Activable & {
		date: string;
	};

export type TravelItems = TravelSelectOption & {
	items: OperationItem[];
};

export const $travelItems = atom<TravelItems[]>([]);

export const $selectOptions = atom<TravelSelectOption[]>([]);

const fetchTravelItems = action($travelItems, 'fetchTravelItems', _store => {
	const history = getHistoryJson();
	$travelItems.set(
		R.addIndex(R.map)((item: any, i: number) => {
			return {
				date: item as string,
				isSelected: false,
				isActive: R.equals(i, 0),
				items: R.map<OperationItem, OperationItem>(
					a => R.assoc('date', item, a),
					R.pathOr([] as OperationItem[], [item] as string[], history),
				),
			};
		}, R.keys(history)),
	);
});

export const activateNextTravelItem = action(
	$travelItems,
	'activateNextTravelItem',
	store => {
		const activeItemIndex = R.findIndex(
			a => R.propEq(true, 'isActive', a),
			$travelItems.get(),
		);
		if (activeItemIndex > -1) {
			const newValue = R.adjust(
				activeItemIndex,
				R.assoc('isActive', false),
				store.get(),
			);
			const stepper = new RangeStepper({
				min: 0,
				max: R.dec(store.get().length),
			});
			stepper.setValue(activeItemIndex);
			stepper.next();
			store.set(R.adjust(stepper.value, R.assoc('isActive', true), newValue));
		} else {
			store.set(R.adjust(0, R.assoc('isActive', true), $travelItems.get()));
		}
	},
);

const activatePreviousTravelItem = action(
	$travelItems,
	'activateNextTravelItem',
	store => {
		const activeItemIndex = R.findIndex(
			a => R.propEq(true, 'isActive', a),
			$travelItems.get(),
		);
		if (activeItemIndex > -1) {
			const newValue = R.adjust(
				activeItemIndex,
				R.assoc('isActive', false),
				store.get(),
			);
			const stepper = new RangeStepper({
				min: 0,
				max: R.dec(store.get().length),
			});
			stepper.setValue(activeItemIndex);
			stepper.previous();
			$travelItems.set(
				R.adjust(stepper.value, R.assoc('isActive', true), newValue),
			);
		} else {
			$travelItems.set(
				R.adjust(0, R.assoc('isActive', true), $travelItems.get()),
			);
		}
	},
);

const selectOptionItem = action(
	$travelItems,
	'selectOptionItem',
	(store, date: string) => {
		const foundIndex = R.findIndex(R.propEq(date, 'date'), store.get());
		if (foundIndex > -1) {
			store.set(
				R.adjust(
					foundIndex,
					R.set<any, boolean>(R.lensProp('isSelected'), true),
					store.get(),
				) as TravelItems[],
			);
		}
	},
);

const selectActiveOption = action($travelItems, 'selectActiveOption', store => {
	const activeIndex = R.findIndex(value => RU.isActive(value), store.get());
	if (RU.isApla(activeIndex)) {
		const selectedIndex = R.findIndex(
			value => RU.isSelected(value),
			store.get(),
		);

		const toSet = RU.isApla(selectedIndex)
			? R.adjust(
					selectedIndex,
					R.over(R.lensProp<Selectable>('isSelected'), R.not),
					store.get(),
				)
			: store.get();

		store.set(
			R.adjust(
				activeIndex,
				R.set(R.lensProp<any>('isSelected'), true),
				toSet,
			) as TravelItems[],
		);
	}
});

const toggleActiveOption = action($travelItems, 'toggleActiveOption', store => {
	const activeIndex = R.findIndex(RU.oAry(RU.isActive), store.get());
	if (RU.isApla(activeIndex)) {
		const selectedIndex = R.findIndex(RU.oAry(RU.oIsSelected), store.get());

		const toSet =
			RU.isApla(selectedIndex) && activeIndex !== selectedIndex
				? R.adjust(selectedIndex, R.modify('isSelected', R.not), store.get())
				: store.get();

		store.set(R.adjust(activeIndex, R.modify('isSelected', R.not), toSet));
	}
});

export const setSelectOptions = action(
	$selectOptions,
	'setSelectOptions',
	(store, options: TravelSelectOption[]) => {
		store.set(options);
	},
);

export const travelItemsManager = {
	fetchTravelItems,
	activateNextTravelItem,
	activatePreviousTravelItem,
	selectOptionItem,
	selectActiveOption,
	toggleActiveOption,
};

// export const selectOption = action(
//     $selectOptions,
//     'selectOption',
//     (store, value: string) => {
//         const targetIndex = R.findIndex(R.propEq(value, 'date'), store.get());

//         if (targetIndex > -1) {
//             store.set(
//                 R.adjust(targetIndex, R.set<any, boolean>(R.lensProp('selected'), true), store.get())
//             );
//         }
//     }
// );

// export const selectNextOption = action(
//     $selectOptions,
//     'selectNextOption',
//     (store) => {
//         if (R.isEmpty(store.get())) {
//             return;
//         }

//         const stepper = new RangeStepper({ min: 0, max: store.get().length - 1 });
//         const targetIndex = R.findIndex(R.propEq(true, 'selected'), store.get());
//         const indexesToRevert = [];
//         if (targetIndex > -1) {
//             stepper.setValue(targetIndex);
//             indexesToRevert.push(targetIndex);
//             // R.adjust(stepper.value, R.set<any, boolean>(R.lensProp('selected'), false), store.get());
//             stepper.next();
//         } else {
//             stepper.setValue(0);
//         }
//         indexesToRevert.push(stepper.value);

//         const newVal = R.reduce(
//             (acc: TravelSelectOption[], ind: number) => {
//                 return R.adjust(
//                     ind,
//                     R.over(R.lensProp<TravelSelectOption>('selected'), (val) => R.not(val)),
//                     acc
//                 ) as any;
//             },
//             $selectOptions.get(),
//             indexesToRevert,
//         );
//         store.set(newVal);
//     }
// );
