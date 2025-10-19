import type {dependenciesKinds} from './constants.js';

type Selectable = {
	isSelected: boolean;
};

type Activable = {
	isActive: boolean;
};

type ActionItem = {
	name: string;
	displayName: string;
	helpMessage?: string;
};

type Action = Selectable &
	Activable & {
		id: number;
		value: ActionItem;
	};

type PackageDetail = Selectable &
	Activable & {
		name: string;
		message: string;
		actionInfo: string;
	};

type ButtonItem = Activable & {
	name: string;
};

type FocusableItem = Activable & {
	id: number;
	kind: string;
	name: string;
	inView?: boolean;
};

type OperationItem = {
	id: string;
	kindOfDependencyKey: string;
	semverValue: string;
	message: string;
	name: string;
	operation: string;
	info: string;
	command: string;
	date: string;
};

type HistoryOperationItem = OperationItem & {
	isVisible: boolean;
};
type HistoryData = {
	limit: number;
	page: number;
	items: OperationItem[];
};

type OpString = 'delete' | 'update';

type HistoryEntry = {
	name: string;
	message: string;
	command: string;
	operation: OpString;
	info: string;
};

type HistoryItems = Record<string, HistoryEntry[]>;

type StatItem = {
	count: number;
	packages: string[];
};
type PackageAction = 'WAITING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
type DependenciesKind = (typeof dependenciesKinds)[number];
type DependenciesEntry = Record<PackageNameString, VersionString>;
type DependenciesEntries = {
	dependencies?: DependenciesEntry;
	devDependencies?: DependenciesEntry;
	peerDependencies?: DependenciesEntry;
};
type VersionString = string;
type PackageNameString = string;
type DependencyPair = [
	DependenciesKind,
	Record<PackageNameString, VersionString>,
];
type PossibleDependencyPair = DependencyPair | undefined;
type TravelStatus = 'WAITING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
type TravelServices = {
	readPackageJson: () => Promise<Record<string, any>>;
	updateDependenciesEntries: (
		packageJsonContent: Record<string, any>,
		updatables: DependenciesEntries,
	) => Record<string, any>;
	updatePacksonEntries: (updatables: DependenciesEntries) => Promise<boolean>;
};
type TravelStatusesManager = {
	setWaiting: () => void;
	setSucceeded: () => void;
	setFailed: () => void;
};

export type {
	ActionItem,
	Action,
	PackageDetail,
	ButtonItem,
	Selectable,
	Activable,
	FocusableItem,
	OperationItem,
	HistoryOperationItem,
	HistoryData,
	HistoryItems,
	HistoryEntry,
	OpString,
	StatItem,
	PackageAction,
	DependenciesKind,
	DependenciesEntries,
	VersionString,
	PackageNameString,
	DependencyPair,
	PossibleDependencyPair,
	TravelStatus,
	TravelServices,
	TravelStatusesManager,
};
