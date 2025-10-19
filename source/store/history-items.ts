import {action, map} from 'nanostores';
import * as R from 'ramda';
import type {HistoryData, OperationItem} from '../types.js';
import {formatHistoryData, getHistoryJson, hasHistory} from '../history.js';

export const $historyItems = map<HistoryData>({
	limit: 10,
	page: 1,
	items: [],
});

const transformItems = (items: OperationItem[]) => {
	return {
		limit: 10,
		page: 1,
		items,
	};
};

const fetchHistory = () => {
	const history = getHistoryJson();
	const transformedItems = transformItems(formatHistoryData(history));
	$historyItems.set(transformedItems);
};

const showNext = action($historyItems, 'showNext', store => {
	const historyData = store.get();

	if (R.gt(historyData.items.length, historyData.page * historyData.limit)) {
		store.setKey('page', historyData.page + 1);
	}
});

const showPrevious = action($historyItems, 'showPrevious', store => {
	const historyData = store.get();

	if (R.gt(historyData.page, 1)) {
		store.setKey('page', historyData.page - 1);
	}
});

export const historyActionsManager = {
	fetchHistory,
	hasHistory,
	showNext,
	showPrevious,
};
