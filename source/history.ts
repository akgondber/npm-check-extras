import fs from 'node:fs';
import path from 'node:path';
import * as R from 'ramda';
import {v4 as uuidv4} from 'uuid';
import type {OperationItem} from './types.js';

const hasHistory = () => {
	// eslint-disable-next-line n/prefer-global/process
	const pathToFile = path.join(process.cwd(), '.npm-check-history.json');
	return fs.existsSync(pathToFile);
};

const readHistory = () => {
	// eslint-disable-next-line n/prefer-global/process
	const pathToFile = path.join(process.cwd(), '.npm-check-history.json');

	if (hasHistory())
		return JSON.parse(fs.readFileSync(pathToFile).toString()) as Record<
			string,
			string
		>;

	return null;
};

const getGroupedHistory = () => {
	const content = readHistory();

	if (!content)
		return 'There is no history for this project. You can store a history by doing some actions with enabled flag.';

	return JSON.stringify(content);
};

const getHistoryJson = () => {
	const content = readHistory();
	return R.defaultTo({}, content);
};

const formatHistoryData = (data: Record<string, any>) => {
	const oper: OperationItem[] = [];

	R.forEach((k: string) => {
		R.forEach(
			(operation: Record<string, string>) => {
				oper.push({
					id: uuidv4(),
					date: k,
					name: R.prop('name', operation),
					operation: R.prop('operation', operation),
					command: R.prop('command', operation),
				});
			},
			data[k] as Array<Record<string, any>>,
		);
	}, R.keys(data));
	return oper;
};

export {getGroupedHistory, getHistoryJson, hasHistory, formatHistoryData};
