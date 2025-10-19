import {readFile, writeFile} from 'node:fs/promises';
import * as R from 'ramda';
import {sortPackageJson} from 'sort-package-json';
import {type DependenciesEntries} from '../types.js';
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

export {readPackageJson, updatePacksonEntries, updateDependenciesEntries};
