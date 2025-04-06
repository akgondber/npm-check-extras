#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import * as R from 'ramda';
import pluralize from 'pluralize';
import App from './app.js';
import RU from './ramda-utils.js';
import {getHistoryJson} from './history.js';
import type {HistoryEntry, OpString, StatItem} from './types.js';
import {operationCountsMapping} from './helpers.js';

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
		--only-stats      Display only stats for updated/deleted packages and exit (it is applicable when you use --store-history option)
		--names           Show package names when --only-stats option is being used
		--date            Show stats only for specific date when --only-stats option is being used


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
			showHistory: {
				type: 'boolean',
				default: false,
				aliases: ['shistory', 'shi', 'shst', 'shist'],
			},
			onlyStats: {
				type: 'boolean',
				default: false,
				aliases: ['report'],
			},
			packageNames: {
				type: 'boolean',
				default: false,
				aliases: ['names'],
			},
			date: {
				type: 'string',
				default: '',
				aliases: ['targetDate'],
			},
		},
	},
);

const {
	checkPackages,
	devOnly,
	production,
	storeHistory,
	skipUnused,
	global,
	showHistory,
} = cli.flags;

if (cli.flags.onlyStats) {
	console.log('Stats:');
	console.log('------');
	let historyItems = getHistoryJson();
	if (!R.isEmpty(cli.flags.date)) {
		historyItems = R.pick([cli.flags.date], historyItems);
	}

	const operationStats: Record<string, Record<OpString, StatItem>> = {};

	R.forEach(pair => {
		operationStats[pair[0]] ||= {} as Record<OpString, StatItem>;
		R.forEach((entry: HistoryEntry) => {
			operationStats[pair[0]]![entry.operation] ||= {} as StatItem;
			operationStats[pair[0]]![entry.operation].count ||= 0;
			operationStats[pair[0]]![entry.operation].count++;
			operationStats[pair[0]]![entry.operation].packages ||= [];
			operationStats[pair[0]]![entry.operation].packages.push(entry.name);
		}, pair[1]);
	}, R.toPairs(historyItems));
	R.addIndex(R.map)((key: any, index: number) => {
		console.log(`${key}: `);
		R.forEach((entry: 'update' | 'delete') => {
			const stats = operationStats[key]![entry];
			console.log(
				`${R.pathOr('', [entry], operationCountsMapping)} ${stats.count} ${pluralize('package', stats.count)}${cli.flags.packageNames ? ':' : '.'}`,
			);
			if (cli.flags.packageNames) {
				const packNames = R.join(
					', ',
					R.map((du: string) => {
						const aCount = RU.aCount(du, stats.packages);
						return aCount === 1 ? du : `${du} * ${aCount}`;
					}, R.uniq(stats.packages)),
				);

				console.log(packNames);
			}
		}, R.keys(operationStats[key]!));
		if (index !== R.keys(operationStats).length - 1) {
			console.log();
		}
	}, R.keys(operationStats));
} else {
	render(
		<App
			isShowPackages={checkPackages}
			isStoreHistory={storeHistory}
			isDevOnly={devOnly}
			isGlobal={global}
			isProduction={production}
			isSkipUnused={skipUnused}
			isShowHistory={showHistory}
		/>,
	);
}
