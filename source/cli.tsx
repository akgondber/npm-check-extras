#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';

const cli = meow(
	`
	Usage
	  $ npm-check-extras

	Options
		--check-packages  Check packages immediately
		--production      Skip devDependencies
		--dev-only        Look at devDependencies only (skip dependencies)
		--global          Look at global modules
		--store-history   Store info about packages actions history to a file (.npm-check-history.json)
		--skip-unused     Skip check for unused packages


	Examples
	  $ npm-check-extras
	  $ npm-check-extras --check-packages
	  $ npm-check-extras --production
	  $ npm-check-extras --prod
	  $ npm-check-extras --check-packages --dev-only
	  $ npm-check-extras --check --dev-only
	  $ npm-check-extras -c -d
	  $ npm-check-extras --skup-unused
`,
	{
		importMeta: import.meta,
		flags: {
			checkPackages: {
				type: 'boolean',
				shortFlag: 'c',
				default: false,
				aliases: ['check'],
			},
			devOnly: {
				type: 'boolean',
				shortFlag: 'd',
				default: false,
				aliases: ['dev'],
			},
			production: {
				type: 'boolean',
				shortFlag: 'p',
				default: false,
				aliases: ['prod'],
			},
			global: {
				type: 'boolean',
				shortFlag: 'g',
				default: false,
			},
			storeHistory: {
				type: 'boolean',
				shortFlag: 'h',
				default: false,
				aliases: ['hist', 'store'],
			},
			skipUnused: {
				type: 'boolean',
				shortFlag: 'u',
				default: false,
				aliases: ['skun'],
			},
		},
	},
);

const {checkPackages, devOnly, production, storeHistory, skipUnused, global} =
	cli.flags;
render(
	<App
		isShowPackages={checkPackages}
		isStoreHistory={storeHistory}
		isDevOnly={devOnly}
		isGlobal={global}
		isProduction={production}
		isSkipUnused={skipUnused}
	/>,
);
