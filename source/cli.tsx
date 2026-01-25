#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import * as R from 'ramda';
import pluralize from 'pluralize';
import {intervalToDuration, isAfter, isBefore, isEqual, parse} from 'date-fns';
import figureSet from 'figures';
import App from './app.js';
import RU from './ramda-utils.js';
import {getHistoryJson} from './history.js';
import type {HistoryEntry, OperationItem, OpString, StatItem} from './types.js';
import {
	coInterval,
	intervalIsLess,
	operationCountsMapping,
	toDafu,
} from './helpers.js';
import {
	type Durationable,
	type SaTravelItems,
	type SaTravelItemsDurationable,
} from './store/travel-items.js';
import {
	transformToPason,
	updatePacksonEntries,
} from './services/package-json-updater.js';

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
		--show-history    Show history of updates and deletes
		--time-travel     Revert changes in package.json from stored history
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
	  $ npm-check-extras --show-history
	  $ npm-check-extras --time-travel
	  $ npm-check-extras --skup-unused
	  $ npm-check-extras --only-stats
	  $ npm-check-extras --report
	  $ npm-check-extras --report --names
	  $ npm-check-extras --report --names --date 2024-11-27
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
			timeTravel: {
				type: 'boolean',
				default: false,
				aliases: [
					'revertchanges',
					'revcha',
					'revupd',
					'revertupd',
					'respack',
					'rech',
				],
			},
			onlyStats: {
				type: 'boolean',
				default: false,
				aliases: ['report'],
			},
			fastRestore: {
				type: 'boolean',
				default: false,
				aliases: ['quickrevert', 'farest', 'restr'],
			},
			nearestDate: {
				type: 'string',
				aliases: ['nearest', 'sibling', 'neighbour'],
				isRequired(flags, _input) {
					if (flags['fastRestore']) {
						return true;
					}

					return false;
				},
			},
			packageNames: {
				type: 'boolean',
				default: false,
				aliases: ['names'],
			},
			travel: {
				type: 'boolean',
				default: false,
				aliases: ['trvl', 'tra'],
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
	timeTravel,
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
} else if (cli.flags.fastRestore) {
	const nearestDate = cli.flags.nearestDate!;
	const rega =
		/^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})(?:\s*(?<hours>\d{2}):(?<minutes>\d{2}))?$/;
	const mathcResult = rega.exec(nearestDate);
	let acca = '';
	let providedFormat = 'yyyy-MM-dd';
	const storedFormat = 'yyyy-MM-dd HH:mm:ss';

	if (mathcResult) {
		const first = [
			R.pathOr('', ['groups', 'year'], mathcResult),
			R.pathOr('', ['groups', 'month'], mathcResult),
			R.pathOr('', ['groups', 'day'], mathcResult),
		];
		acca += R.join('-', first);
		const second = [
			R.pathOr('00', ['groups', 'hours'], mathcResult),
			R.pathOr('00', ['groups', 'minutes'], mathcResult),
		];
		if (second.length > 0) {
			providedFormat += ' HH:mm:ss';
			acca += ` ${R.join(':', second)}:00`;
		}

		console.log(providedFormat);

		const nearestParsed = parse(acca, providedFormat, new Date());
		const history = getHistoryJson();
		const collected: SaTravelItems[] = R.addIndex(R.map)(
			(item: any, i: number) => {
				return {
					date: item as string,
					isSelected: false,
					isActive: R.equals(i, 0),
					items: R.map<OperationItem, OperationItem>(
						a => R.assoc('date', item, a),
						R.pathOr([] as OperationItem[], [item] as string[], history),
					),
				};
			},
			R.keys(history),
		);
		const fu = R.map<SaTravelItems, SaTravelItemsDurationable>(
			ba =>
				R.mergeDeepRight<SaTravelItems, Durationable>(ba, {
					duration: intervalToDuration(
						coInterval(ba.date, storedFormat, acca, providedFormat),
					),
				}),
			collected,
		);
		const historyElements = R.sort<SaTravelItemsDurationable>(
			(a, b) =>
				R.when(
					() => intervalIsLess(a.duration, b.duration),
					R.always(0),
					R.always(1),
				) as number,
			fu,
		);
		const kin = R.takeWhile(
			a =>
				isEqual(nearestParsed, toDafu(a.date)) ||
				isAfter(nearestParsed, toDafu(a.date)),
			historyElements,
		);
		const kon = R.takeLastWhile(
			a => isBefore(nearestParsed, toDafu(a.date)),
			historyElements,
		);
		if (R.isEmpty(kin) || R.isEmpty(kon)) {
			console.log(`There is no entry nearest to provided date time.`);
		} else {
			const firstInterval = intervalToDuration(
				coInterval(R.last(kin)!.date, storedFormat, acca, providedFormat),
			);
			const secondInterval = intervalToDuration(
				coInterval(acca, providedFormat, R.head(kon)!.date, storedFormat),
			);

			const computedNearest = intervalIsLess(firstInterval, secondInterval)
				? R.last(kin)
				: R.head(kon);
			if (!R.isNil(computedNearest)) {
				const updatableEntries = transformToPason(computedNearest?.items);
				const isSuccess = await updatePacksonEntries(updatableEntries);
				console.log(
					isSuccess
						? `${figureSet.tick} The package.json file was successfully reverted`
						: `${figureSet.cross} There was an error while reverting package.json file.`,
				);
			}
		}
	} else {
		console.log(
			`Provided nearestDate option is wrong. Please make sure you use either yyyy-MM-dd or yyyy-MM-dd HH:mm fromat.`,
		);
	}
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
			isRevertUpdates={timeTravel}
		/>,
	);
}
