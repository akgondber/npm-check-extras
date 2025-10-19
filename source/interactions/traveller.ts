import type {TravelServices, TravelStatusesManager} from '../types.js';
import {travelServices} from '../services/index.js';
import {travelStatusesManager as TAM} from '../store/travel-status.js';

export default class Traveller {
	constructor(
		public travelServices: TravelServices,
		public statusesManager: TravelStatusesManager,
	) {}

	async revertEntriesInPackageJson(updatables: Record<string, any>) {
		const result = await this.travelServices.updatePacksonEntries(updatables);
		if (result) {
			this.statusesManager.setSucceeded();
		} else {
			this.statusesManager.setFailed();
		}
	}
}

export const traveller = new Traveller(travelServices, TAM);
