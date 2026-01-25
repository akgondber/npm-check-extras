import * as R from 'ramda';
import {v4 as uuidv4} from 'uuid';
import {type Duration, parse} from 'date-fns';
import {type Action, type FocusableItem, type PackageDetail} from './types.js';
import {focusableItemsManager} from './store/focusable-items.js';
import {colors} from './defaults.js';

const getId = (): string => {
	return uuidv4();
};

const isAvailableChar = (value: string): boolean => {
	if (value === '') return false;

	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	const numbers = '123456789';
	const otherChars = '\\/\'"-+=_!@#$%^&*()<?>.,:;{[]}';
	const availableChars = `${alphabet}${numbers}${otherChars}`;

	return availableChars.includes(value);
};

const getNextIndex = (current: number, size: number): number => {
	return R.ifElse(R.gt(size), R.identity, R.subtract(size))(R.inc(current));
};

const getPreviousIndex = (current: number, size: number): number => {
	return R.ifElse(R.lte(0), R.identity, R.add(size))(R.dec(current));
};

const getCommandFromSentence = (sentence: string): string => {
	if (sentence.includes(' to go')) {
		return R.compose(R.head, R.split)(' to go', sentence) as string;
	}

	if (sentence.includes('age:')) {
		return R.compose(R.last, R.split)('kage: ', sentence) as string;
	}

	return '';
};

const removeUrl = (source: string): string => {
	/* eslint-disable unicorn/prefer-string-replace-all */
	return R.trim(source.replace(/(?:https?|ftp):\/\/[\n\S]+/g, ''));
	/* eslint-enable unicorn/prefer-string-replace-all */
};

const selectify = R.set(R.lensProp<PackageDetail>('isSelected'), true);
const unselectify = R.set(R.lensProp<PackageDetail>('isSelected'), false);
const activate = R.set(R.lensProp<FocusableItem>('isActive'), true);
const deactivate = R.set(R.lensProp<FocusableItem>('isActive'), false);
const activatePackage = R.set(R.lensProp<PackageDetail>('isActive'), true);
const deactivatePackage = R.set(R.lensProp<PackageDetail>('isActive'), false);
const activateOptionItem = R.set(R.lensProp<Action>('isActive'), true);
const deactivateOptionItem = R.set(R.lensProp<Action>('isActive'), false);
const toggleActionItem = R.over(R.lensProp<Action>('isSelected'), R.not);
const selectAction = R.set(R.lensProp<Action>('isSelected'), true);
const unselectAction = R.set(R.lensProp<Action>('isSelected'), false);
const getSelected = R.filter(value => R.equals(true, value));
const markInView = R.set(R.lensProp<FocusableItem>('inView'), true);
const unmarkInView = R.set(R.lensProp<FocusableItem>('inView'), false);
const getButtonColor = (name: string) =>
	focusableItemsManager.isActive(name)
		? colors.activeButton.color
		: colors.button.color;
const getButtonBgColor = (name: string) =>
	focusableItemsManager.isActive(name)
		? colors.activeButton.bg
		: colors.button.bg;

const getPanelColor = (result: boolean) => (result ? 'green' : 'grey');

const operationCountsMapping = {
	update: 'Updated',
	delete: 'Deleted',
};
const prepSpaces = (value: string) => {
	return `  ${value}`;
};

const wrasp = (value: string) => {
	return ` ${value} `;
};

const preJson = (value: Record<string, any>) => {
	return JSON.stringify(value, null, 2);
};

const toDa = (dateString: string, format: string) => {
	return parse(dateString, format, new Date());
};

const toDafu = (dateString: string) => {
	return parse(dateString, 'yyyy-MM-dd HH:mm:ss', new Date());
};

const coInterval = (
	firstDate: string,
	firstFormat: string,
	secondDate: string,
	secondFormat: string,
) => {
	return {
		start: parse(firstDate, firstFormat, new Date()),
		end: parse(secondDate, secondFormat, new Date()),
	};
};

const intervalIsLess = (firstDur: Duration, secondDur: Duration) => {
	if (!R.isNil(secondDur.years)) {
		if (R.isNil(firstDur.years)) {
			return true;
		}

		if (secondDur.years !== firstDur.years) {
			return secondDur.years > firstDur.years;
		}
	}

	if (!R.isNil(secondDur.months)) {
		if (R.isNil(firstDur.months)) {
			return true;
		}

		if (secondDur.months !== firstDur.months) {
			return secondDur.months > firstDur.months;
		}
	}

	if (!R.isNil(secondDur.days)) {
		if (R.isNil(firstDur.days)) {
			return true;
		}

		if (secondDur.months !== firstDur.months) {
			return secondDur.days > firstDur.days;
		}
	}

	if (!R.isNil(secondDur.hours)) {
		if (R.isNil(firstDur.hours)) {
			return true;
		}

		if (secondDur.hours !== firstDur.hours) {
			return secondDur.hours > firstDur.hours;
		}
	}

	if (!R.isNil(secondDur.minutes)) {
		if (R.isNil(firstDur.minutes)) {
			return true;
		}

		if (secondDur.minutes !== firstDur.minutes) {
			return secondDur.minutes > firstDur.minutes;
		}
	}

	if (!R.isNil(secondDur.seconds)) {
		if (R.isNil(firstDur.seconds)) {
			return true;
		}

		if (secondDur.seconds !== firstDur.seconds) {
			return secondDur.seconds > firstDur.seconds;
		}
	}

	return false;
};

export {
	getId,
	isAvailableChar,
	getCommandFromSentence,
	removeUrl,
	selectify,
	unselectify,
	activate,
	deactivate,
	activateOptionItem,
	deactivateOptionItem,
	toggleActionItem,
	getSelected,
	getButtonColor,
	getButtonBgColor,
	activatePackage,
	deactivatePackage,
	getNextIndex,
	getPreviousIndex,
	selectAction,
	unselectAction,
	getPanelColor,
	markInView,
	unmarkInView,
	operationCountsMapping,
	prepSpaces,
	wrasp,
	preJson,
	toDa,
	toDafu,
	coInterval,
	intervalIsLess,
};
