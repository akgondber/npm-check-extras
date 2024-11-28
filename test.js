import React from 'react';
import chalk from 'chalk';
import test from 'ava';
import {render} from 'ink-testing-library';
import {isAvailableChar} from './dist/helpers.js';
import App from './dist/app.js';

test('shows options panel', t => {
	const {lastFrame} = render(<App />);

	t.true(lastFrame().includes('Set up desired options'));
});

test('that is true', t => {
	t.true(typeof render === 'function');
});

test('char is available to be typed', t => {
	t.true(typeof chalk.red === 'function');
	t.true(isAvailableChar('f'));
});

test('char is not available to be typed', t => {
	t.false(isAvailableChar('~'));
});
