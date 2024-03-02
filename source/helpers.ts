import * as R from 'ramda';
import {v4 as uuidv4} from 'uuid';
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
const getButtonColor = (name: string) =>
	focusableItemsManager.isActive(name)
		? colors.activeButton.color
		: colors.button.color;
const getButtonBgColor = (name: string) =>
	focusableItemsManager.isActive(name)
		? colors.activeButton.bg
		: colors.button.bg;

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
};
