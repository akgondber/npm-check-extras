import test from 'ava';
import {addToSelected} from '../../dist/actions/options-manager.js';

test('adds to selected indexes new value', t => {
	t.deepEqual(addToSelected(32), [32]);
});
