import test from 'ava';
import {cleanStores, keepMount} from 'nanostores';
import {
	$focusableItems,
	focusableItemsManager,
} from '../../dist/store/focusable-items.js';

test.after(() => {
	cleanStores($focusableItems);
});

test('activates appropriate items', t => {
	keepMount($focusableItems);
	focusableItemsManager.activateByName('packages-panel');

	t.deepEqual($focusableItems.get(), [
		{
			id: 1,
			name: 'options-panel',
			kind: 'panel',
			isActive: false,
		},
		{
			id: 2,
			name: 'check-packages',
			kind: 'button',
			isActive: false,
		},
		{
			id: 3,
			name: 'packages-panel',
			kind: 'panel',
			isActive: true,
		},
		{
			id: 4,
			name: 'filter-input',
			kind: 'input',
			isActive: false,
		},
		{
			id: 5,
			name: 'update',
			kind: 'button',
			isActive: true,
		},
	]);
});
