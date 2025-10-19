import type {TravelServices} from '../types.js';
import {
	readPackageJson,
	updateDependenciesEntries,
	updatePacksonEntries,
} from './package-json-updater.js';

export const travelServices: TravelServices = {
	readPackageJson,
	updateDependenciesEntries,
	updatePacksonEntries,
};
