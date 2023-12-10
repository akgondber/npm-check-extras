import React, {useEffect} from 'react';
import {Box, Text, useInput} from 'ink';
import Spinner from 'ink-spinner';
import {useStore} from '@nanostores/react';
import * as R from 'ramda';
import figureSet from 'figures';
import type {SpinnerName} from 'cli-spinners';
import {
	getButtonBgColor,
	getButtonColor,
	getCommandFromSentence,
	getId,
	getSelected,
	isAvailableChar,
	removeUrl,
} from './helpers.js';
import {$availableActions} from './store.js';
import {
	$actionStatus,
	$allItems,
	packageActionsManager as PAM,
} from './store/packages.js';
import {$panelStepper} from './store/panel-stepper.js';
import {optionsManager} from './store/options.js';
import {$userInput, inputActions} from './store/user-input.js';
import {$status, statusesManager, setStatusText} from './store/status.js';
import {packagesActions} from './actions/packages.js';
import {
	$focusableItems,
	focusableItemsManager,
} from './store/focusable-items.js';
import {type Action} from './types.js';
import RU from './ramda-utils.js';

type Props = {
	readonly isShowPackages?: boolean;
	readonly isStoreHistory?: boolean;
	readonly isDevOnly?: boolean;
	readonly isProduction?: boolean;
	readonly isSkipUnused?: boolean;
};

type TextItem = {
	readonly text?: string;
};

function SuccessText({text}: TextItem) {
	return (
		<Text>
			<Text color="green">{figureSet.tick} </Text>
			{text}
		</Text>
	);
}

function ErrorText({text}: TextItem) {
	return (
		<Text>
			<Text color="red">{figureSet.cross} </Text>
			{text}
		</Text>
	);
}

export default function App({
	isShowPackages,
	isDevOnly,
	isProduction,
	isStoreHistory,
	isSkipUnused,
}: Props) {
	const availableActions = useStore($availableActions);
	const allItems = useStore($allItems);
	useStore($focusableItems);
	const panelStepper = useStore($panelStepper);
	const userInput = useStore($userInput);
	useStore($actionStatus);
	const status = useStore($status);

	useEffect(() => {
		if (isProduction) optionsManager.selectWithChecks('production');
		else if (isDevOnly) optionsManager.selectWithChecks('dev-only');

		R.keys(
			getSelected({
				'store-history': isStoreHistory,
				'skip-unused': isSkipUnused,
			}),
		).map(R.nAry(1, optionsManager.selectByName));

		if (isShowPackages) {
			/* eslint-disable no-inner-declarations */
			async function fetchData() {
				await PAM.checkPackages();
				packagesActions.activateFirstPackage();
				focusableItemsManager.activateByName('packages-panel');
			}
			/* eslint-enable no-inner-declarations */

			fetchData(); // eslint-disable-line @typescript-eslint/no-floating-promises
		}

		return $userInput.subscribe(value => {
			packagesActions.selectPackagesByFilter(value.value);
		});
	}, [isShowPackages, isDevOnly, isProduction, isStoreHistory, isSkipUnused]);

	/* eslint-disable complexity */
	useInput(async (input, key) => {
		if (key.return) {
			if (focusableItemsManager.isPanelActive('options-panel')) {
				inputActions.clear();
				PAM.setWaiting();
				await PAM.checkPackages();
				packagesActions.activateFirstPackage();
				focusableItemsManager.activateByName('packages-panel');
			} else if (
				focusableItemsManager.isPanelActive('packages-panel') &&
				R.count(RU.isSelected, allItems) > 0
			) {
				await PAM.runUpdate();
				if (!PAM.isFailed()) packagesActions.removeSelectedPackagesFromList();
			}
		} else if (key.tab) {
			focusableItemsManager.activateNext();
		} else if (key.backspace) {
			if (panelStepper.isCurrent(1)) {
				inputActions.deletePrevious();
			}
		} else if (key.delete) {
			if (panelStepper.isCurrent(1)) {
				inputActions.deleteCurrent();
			}
		} else if (key.leftArrow) {
			inputActions.moveLeft();
		} else if (key.rightArrow) {
			inputActions.moveRight();
		} else if (key.downArrow) {
			if (focusableItemsManager.isPanelActive('options-panel')) {
				optionsManager.activateNextOption();
			} else if (focusableItemsManager.isPanelActive('packages-panel')) {
				packagesActions.activateNextPackage();
			}
		} else if (key.upArrow) {
			if (focusableItemsManager.isPanelActive('options-panel')) {
				optionsManager.activatePreviousOption();
			} else if (focusableItemsManager.isPanelActive('packages-panel')) {
				packagesActions.activatePreviousPackage();
			}
		} else if (input === ' ') {
			if (focusableItemsManager.isPanelActive('packages-panel')) {
				packagesActions.toggleActive();
			} else {
				setStatusText('Updating current options');
				optionsManager.toggle();
			}
		} else if (isAvailableChar(input)) {
			inputActions.addCharAtCurrentPoition(input);
		}
	});
	/* eslint-enable complexity */

	const getDisplayValues = () => {
		return allItems.map(item => (
			<Box key={getId()}>
				<Text color="#e7b178">
					{item.isActive ? figureSet.pointer : ' '}&nbsp;
				</Text>
				<Text>
					{item.isSelected ? (
						PAM.isRunning() ? (
							<Spinner type="dots9" />
						) : (
							figureSet.squareSmallFilled
						)
					) : (
						figureSet.squareSmall
					)}
				</Text>
				<Box flexDirection="row">
					{PAM.isRunning() && packagesActions.isSelected(item) ? (
						<Text>
							&nbsp;{item.name}&nbsp;&nbsp;
							<Text color="green">
								{getCommandFromSentence(item.actionInfo)}
							</Text>
						</Text>
					) : (
						<Text>
							<Text color="cyan">&nbsp;{item.name}</Text>
							<Text>&nbsp;{removeUrl(item.message)}</Text>
							<Text italic> {getCommandFromSentence(item.actionInfo)}</Text>
						</Text>
					)}
				</Box>
			</Box>
		));
	};

	const perhapsPointer = (item: Action) => {
		return item.isActive && <Text color="cyan">{figureSet.pointer}</Text>;
	};

	const displayStatus = (item: Action) => {
		return item.isSelected ? (
			<Text>{figureSet.squareSmallFilled} -</Text>
		) : (
			<Text>{figureSet.squareSmall} -</Text>
		);
	};

	function SpinnerItem({
		text,
		kind = 'dots9',
	}: {
		readonly text: string;
		readonly kind?: SpinnerName;
	}) {
		return (
			<Text color="green">
				<Spinner type={kind} /> {text}
			</Text>
		);
	}

	const {value: inputValue, focusedChar} = userInput;
	const textPrefix = (): JSX.Element | undefined => {
		if (statusesManager.isFetching()) {
			return <Spinner type="bluePulse" />;
		}

		if (
			statusesManager.isDone() &&
			!R.equals(status.text, 'Updating current options')
		) {
			return <SuccessText />;
		}

		return undefined;
	};

	return (
		<Box flexDirection="column">
			<Box
				flexDirection="column"
				borderStyle="single"
				borderColor={
					focusableItemsManager.isPanelActive('options-panel')
						? 'green'
						: 'orange'
				}
			>
				<Text>
					{textPrefix()}
					<Text italic>{status.text}</Text>
				</Text>
				<Box flexDirection="column" />
				<Text>
					<Text bold>{figureSet.arrowUp}</Text> and{' '}
					<Text bold>{figureSet.arrowDown}</Text> to activate the next option
					<Text bold> &lt;space&gt; - toggle active option</Text>
					<Text bold> &lt;Enter&gt; - submit</Text>
				</Text>
				{availableActions.map(action => (
					<Box key={`ac-${action.id}`}>
						<Text>
							{perhapsPointer(action)}
							{action.isActive ? ' ' : '  '}
						</Text>
						<Text>
							{displayStatus(action)} {action.value.displayName}
						</Text>
					</Box>
				))}
				<Box>
					{statusesManager.isFetching() ? (
						<SpinnerItem text="Checking" kind="dots3" />
					) : (
						<Text
							color={getButtonColor('check-packages')}
							backgroundColor={getButtonBgColor('check-packages')}
						>
							Check dependencies
						</Text>
					)}
				</Box>
			</Box>
			{(statusesManager.isDone() || statusesManager.isFailed()) &&
				!statusesManager.isFetching() && (
					<Box
						borderStyle="single"
						borderColor={
							focusableItemsManager.isPanelActive('packages-panel')
								? 'green'
								: 'gray'
						}
						flexDirection="column"
					>
						<Box flexDirection="column">
							{!statusesManager.isFetching() && allItems.length > 0 && (
								<Text>
									<Text bold>{figureSet.arrowUp}</Text> and{' '}
									<Text bold>{figureSet.arrowDown}</Text> to activate the next
									package
									<Text bold>
										{' '}
										&lt;space&gt; - select/unselect active package&nbsp;
									</Text>
									{focusableItemsManager.isActive('update') ? (
										<Text bold> &lt;Enter&gt; - submit</Text>
									) : (
										<Text>
											<Text bold>&lt;tab&gt;</Text> - activate{' '}
											<Text bold>Submit</Text> button
										</Text>
									)}
								</Text>
							)}
							{statusesManager.isFetching() ? (
								<SpinnerItem text="Running" kind="dots9" />
							) : allItems.length > 0 ? (
								<Text>
									{figureSet.triangleDown} The following packages could be
									updated/deleted {figureSet.triangleDown}
									&nbsp;Select necessary ones and submit to update/delete them.
								</Text>
							) : (
								!PAM.isWaiting() && (
									<Text>There are no packages to update/delete.</Text>
								)
							)}
						</Box>
						<Box flexDirection="column">
							<Box flexDirection="column" marginTop={1}>
								{getDisplayValues()}
							</Box>
							<Box flexDirection="column" marginTop={1}>
								<Box>
									<Text
										color="#90cba5"
										italic={focusableItemsManager.isActive('packages-panel')}
									>
										Type something to select items by filter query:&nbsp;
									</Text>
									{focusedChar === 0 ? (
										<Text>
											<Text inverse>{inputValue.slice(0, 1) || ' '}</Text>
											<Text>{inputValue.slice(1, inputValue.length)}</Text>
										</Text>
									) : (
										<Text>
											{inputValue.slice(0, focusedChar)}
											<Text inverse>
												{focusedChar === inputValue.length
													? ' '
													: inputValue.at(focusedChar)}
											</Text>
											{focusedChar < inputValue.length - 1 && (
												<Text>
													{inputValue.slice(focusedChar + 1, inputValue.length)}
												</Text>
											)}
										</Text>
									)}
								</Box>
							</Box>
							<Box>
								<Text
									color={getButtonColor('update')}
									backgroundColor={getButtonBgColor('update')}
								>
									{PAM.isRunning() ? (
										<SpinnerItem text="Submitting..." />
									) : (
										'Submit'
									)}
								</Text>
							</Box>
							<Box>
								{PAM.isSuccess() ? (
									<SuccessText />
								) : PAM.isFailed() ? (
									<ErrorText />
								) : null}
								<Text>
									{R.cond([
										[R.invoker(0, 'isWaiting'), R.always('')],
										[
											R.invoker(0, 'isRunning'),
											R.always('Updating selected packages...'),
										],
										[
											R.invoker(0, 'isSuccess'),
											R.always(
												'Actions over selected packages have been performed.',
											),
										],
										[
											R.invoker(0, 'isFailed'),
											R.always('Some error occured while performing actions.'),
										],
										[R.T, R.always('')],
									])(PAM)}
								</Text>
							</Box>
						</Box>
					</Box>
				)}
		</Box>
	);
}
