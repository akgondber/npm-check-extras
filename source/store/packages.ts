import fs from 'node:fs';
import path from 'node:path';
import * as R from 'ramda';
import {atom, computed} from 'nanostores';
import {execa, execaCommand, type ExecaError} from 'execa';
import {type PackageDetail} from '../types.js';
import {getCommandFromSentence} from '../helpers.js';
import ramdaUtils from '../ramda-utils.js';
import {optionsManager} from './options.js';
import {$submittedInput} from './submitted-input.js';
import {statusesManager} from './status.js';

type PackageAction = 'WAITING' | 'RUNNING' | 'SUCCESS' | 'FAILED';

export const $allItems = atom<PackageDetail[]>([]);

export const selectedItems = R.filter(
	R.propEq(true, 'isSelected'),
	$allItems.get(),
);

export const $filteredItems = computed(
	[$allItems, $submittedInput],
	(allItems, submittedInput) => {
		return R.filter(
			R.propSatisfies(R.includes(submittedInput), 'name'),
			allItems,
		);
	},
);

export function clearPackages() {
	$allItems.set([]);
}

export const getUpdateCandidatePackages = async (): Promise<
	PackageDetail[]
> => {
	const temporary: PackageDetail[] = [];
	const addSelectedOptionsToArgs = (optionNames: string[]) => {
		return R.reduce(
			(acc: string[], optionName): string[] =>
				optionsManager.isSelectedByName(optionName)
					? R.append(`--${optionName}`, acc)
					: acc,
			[],
			optionNames,
		);
	};

	const args = [
		'--no-colors',
		'--no-emoji',
		...addSelectedOptionsToArgs([
			'dev-only',
			'production',
			'global',
			'skip-unused',
		]),
	];

	const isExecaError = (error: any): error is ExecaError => {
		return R.isNotNil(error.stdout);
	};

	try {
		await execa('npx', ['npm-check', ...args]);
	} catch (error: any) {
		if (isExecaError(error)) {
			const lines = error.stdout.split('\n');

			for (const curr of R.splitWhenever(R.equals(''), lines)) {
				const parts = R.head(curr)!.split(/\s{2,}/);

				if (
					!R.pathSatisfies(R.includes('npm-check -u'), [0])(parts) &&
					R.length(curr) > 1 &&
					!R.pathSatisfies(
						(value: string) => value.includes('PKG ERR!  Not in'),
						[1],
						curr,
					)
				)
					temporary.push({
						name: R.head(parts)!,
						message: R.join('  ', R.drop(2, parts)),
						actionInfo: R.compose(R.trim, R.last)(curr),
						isSelected: false,
						isActive: false,
					});
			}
		}
	}

	return temporary;
};

const checkPackages = async () => {
	clearPackages();
	statusesManager.setFetching();
	clearPackages();

	try {
		const reportedPackages = await getUpdateCandidatePackages();
		$allItems.set(reportedPackages);
		statusesManager.setDone();
	} catch {
		statusesManager.setFailed();
	}
};

const getOperationFromInfo = (message: string) => {
	return R.cond([
		[
			R.compose(R.not, R.isEmpty, R.match(/to go from \d+/)),
			R.always('update'),
		],
		[R.includes('remove this package'), R.always('delete')],
		[R.T, R.always('unknown')],
	])(message);
};

export const runUpdate = async () => {
	const needsToStoreHistory = optionsManager.isSelectedByName('store-history');
	const itemsToUpdate = R.filter(R.propEq(true, 'isSelected'), $allItems.get());
	packageActionsManager.setRunning();

	try {
		const pathToFile = path.join(process.cwd(), '.npm-check-history.json'); // eslint-disable-line n/prefer-global/process
		const today = new Date().toISOString().slice(0, 10);
		let previousContent: Record<string, string> = {};
		if (fs.existsSync(pathToFile))
			previousContent = JSON.parse(
				fs.readFileSync(pathToFile).toString(),
			) as Record<string, string>;
		const contentToSave: Array<Record<string, any>> = R.propOr(
			[],
			today,
			previousContent,
		);

		await Promise.all(
			R.map(async (selectedItem: PackageDetail) => {
				const actionValue = getCommandFromSentence(selectedItem.actionInfo);

				await execaCommand(actionValue);

				if (needsToStoreHistory) {
					contentToSave.push({
						name: selectedItem.name,
						message: selectedItem.message,
						command: getCommandFromSentence(selectedItem.actionInfo),
						operation: getOperationFromInfo(selectedItem.actionInfo),
						info: selectedItem.actionInfo,
					});
				}
			}, itemsToUpdate),
		);
		if (needsToStoreHistory) {
			const newContent = R.assoc(today, contentToSave, previousContent);
			fs.writeFileSync(pathToFile, JSON.stringify(newContent, null, 2));
		}

		packageActionsManager.setSuccess();
	} catch (error: any) {
		if (error instanceof Error) {
			fs.appendFileSync('.npm-check-extras-debug.log', `${error.message}\n`);
			packageActionsManager.setFailed();
		}
	}
};

export const $actionStatus = atom<PackageAction>('WAITING');
export const hasPackages = computed(
	$allItems,
	allItems => !R.isEmpty(allItems),
);

export const packageActionsManager = {
	runUpdate,
	checkPackages,
	isWaiting: () => ramdaUtils.eqWaiting($actionStatus.get()),
	isRunning: () => ramdaUtils.eqRunning($actionStatus.get()),
	isSuccess: () => ramdaUtils.eqSuccess($actionStatus.get()),
	isFailed: () => ramdaUtils.eqFailed($actionStatus.get()),
	setWaiting() {
		$actionStatus.set('WAITING');
	},
	setRunning() {
		$actionStatus.set('RUNNING');
	},
	setSuccess() {
		$actionStatus.set('SUCCESS');
	},
	setFailed() {
		$actionStatus.set('FAILED');
	},
};
