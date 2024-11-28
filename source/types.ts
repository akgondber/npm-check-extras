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
	date: string;
	name: string;
	operation: string;
	command: string;
};

type HistoryOperationItem = OperationItem & {
	isVisible: boolean;
};
type HistoryData = {
	limit: number;
	page: number;
	items: OperationItem[];
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
};
