import {atom} from 'nanostores';

export const $submittedInput = atom<string>('');

export function setSubmittedInput(value: string) {
	$submittedInput.set(value);
}

export function addChar(value: string) {
	$submittedInput.set($submittedInput.get() + value);
}
