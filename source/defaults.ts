import {type ActionItem} from './types.js';

export const availableActions: ActionItem[] = [
	{
		name: 'store-history',
		displayName: 'Store history in file',
		helpMessage: 'Write history of packages manaipulation to the file',
	},
	{
		name: 'skip-unused',
		displayName: 'Skip unused',
		helpMessage: `
		By default npm-check will let you know if any of your modules are not being used by looking at require statements in your code.
		This option will skip that check.`,
	},
	{
		name: 'dev-only',
		displayName: 'Only devDependenices',
		helpMessage: `
		Ignore dependencies and only check devDependencies.
		This option will let it ignore outdated and unused checks for packages listed as dependencies.`,
	},
	{
		name: 'production',
		displayName: 'Only production',
		helpMessage: `
		By default npm-check will look at packages listed as dependencies and devDependencies.
		This option will let it ignore outdated and unused checks for packages listed as devDependencies.`,
	},
	{
		name: 'global',
		displayName: 'Look at global modules',
		helpMessage: 'Check the versions of your globally installed packages.',
	},
	{
		name: 'show-history',
		displayName: 'Display dependencies history',
		helpMessage: 'Display information about previous packages manipualtions',
	},
];

export const colors = {
	button: {
		bg: '#c7d3d4',
		color: '#603f83',
	},
	activeButton: {
		bg: '#FEE715',
		color: '#101820',
	},
};
