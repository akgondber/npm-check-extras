import {map} from 'nanostores';

export const $userInput = map({
	value: '',
	focusedChar: 0,
});

export const inputActions = {
	clear() {
		$userInput.setKey('value', '');
	},
	deleteCurrent() {
		const {value, focusedChar} = $userInput.get();

		$userInput.setKey(
			'value',
			value.slice(0, focusedChar) + value.slice(focusedChar + 1),
		);
	},
	deletePrevious() {
		const {value, focusedChar} = $userInput.get();
		if (focusedChar === 0) {
			return;
		}

		$userInput.setKey(
			'value',
			value.slice(0, focusedChar - 1) + value.slice(focusedChar),
		);
		$userInput.setKey('focusedChar', focusedChar - 1);
	},
	addCharAtCurrentPoition(newChar: string) {
		const {value, focusedChar} = $userInput.get();

		$userInput.setKey(
			'value',
			value.slice(0, focusedChar) + newChar + value.slice(focusedChar),
		);
		$userInput.setKey('focusedChar', focusedChar + 1);
	},
	moveLeft() {
		const {focusedChar} = $userInput.get();

		$userInput.setKey('focusedChar', focusedChar === 0 ? 0 : focusedChar - 1);
	},
	moveRight() {
		const {value, focusedChar} = $userInput.get();

		$userInput.setKey(
			'focusedChar',
			focusedChar === value.length ? value.length : focusedChar + 1,
		);
	},
};
