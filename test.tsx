import React from 'react';
import chalk from 'chalk';
import test from 'ava';
import {render} from 'ink-testing-library';
import App from './source/app.js';

test('renders app', t => {
	const {lastFrame} = render(<App />);

	t.true(lastFrame()!.includes('Set up desired options'));
});

test('everyhing is ok', t => {
	t.true(typeof chalk.red === 'function');
});
