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
};

export type {
	ActionItem,
	Action,
	PackageDetail,
	ButtonItem,
	Selectable,
	Activable,
	FocusableItem,
};
