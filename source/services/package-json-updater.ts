import {readFile, writeFile} from 'node:fs/promises';
import * as R from 'ramda';
import {sortPackageJson} from 'sort-package-json';
import {type OperationItem, type DependenciesEntries} from '../types.js';
import {preJson} from '../helpers.js';

const readPackageJson = async (): Promise<Record<string, any>> => {
	const packageJsonFile = await readFile('package.json', 'utf8');
	return JSON.parse(packageJsonFile) as Record<string, any>;
};

const updateDependenciesEntries = (
	packageJsonContent: Record<string, any>,
	updatables: DependenciesEntries,
) => {
	const spec = R.map(value => {
		return R.mergeDeepLeft(R.defaultTo({}, value));
	}, updatables);
	return R.evolve(spec, packageJsonContent) as Record<string, any>;
};

const updatePacksonEntries = async (updatables: DependenciesEntries) => {
	const currentPackson = await readPackageJson();
	const spec = R.map(value => {
		return R.mergeDeepLeft(R.defaultTo({}, value), {});
	}, updatables);
	const newContent = R.mergeDeepLeft(spec, currentPackson);
	let result = false;
	try {
		await writeFile('package.json', preJson(sortPackageJson(newContent)));
		result = true;
	} catch {
		result = false;
	}

	return result;
};

const transformToPason = (items: OperationItem[]): Record<string, any> => {
	const result: Record<string, any> = R.reduce(
		(acc: Record<string, any>, curr: OperationItem) => {
			const currKey = curr.kindOfDependencyKey;
			const packageWithSemver = R.objOf(curr.name, curr.semverValue);
			if (R.has(currKey, acc)) {
				acc = R.modify<any, any, any>(
					currKey,
					(entry: Record<string, any>) => {
						return R.mergeDeepLeft(packageWithSemver, entry);
					},
					acc,
				);
			} else {
				acc = R.assoc(currKey, packageWithSemver, acc);
			}

			return acc;
		},
		{},
		items,
	);
	return result;
};

export {
	readPackageJson,
	updatePacksonEntries,
	updateDependenciesEntries,
	transformToPason,
};
