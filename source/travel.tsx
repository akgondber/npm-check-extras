import React, {useEffect} from 'react';
import {Text, Box} from 'ink';
import * as R from 'ramda';
import {useStore} from '@nanostores/react';
import figureSet from 'figures';
import pluralize from 'pluralize';
import {$travelItems} from './store/travel-items.js';
import {$travelStatus} from './store/travel-status.js';
import {SelectedText, SuccessText} from './components/TextItem.js';
import {prepSpaces, wrasp} from './helpers.js';

export default function Travel() {
	const travelItems = useStore($travelItems);
	const travelStatus = useStore($travelStatus);

	useEffect(() => {
		// fetchTravelItems();
	}, []);

	return (
		<Box flexDirection="column">
			<Box>
				<Box>
					<Text bold color="cyan">
						{figureSet.arrowUp}
					</Text>
					<Text>,</Text>
					<Text bold color="cyan">
						{figureSet.arrowDown}
					</Text>
					<Text> - move up and down</Text>
				</Box>
				<Box>
					<Text bold>{`${prepSpaces('<space>')}`}</Text>
					<Text> - select active item</Text>
				</Box>
				<Box>
					<Text bold>{prepSpaces('<ENTER>')}</Text>
					<Text> - submit</Text>
				</Box>
			</Box>
			<Text />
			{R.map(travelItem => {
				return (
					<Box key={`${travelItem.date}`}>
						{travelItem.isActive ? (
							<Text color="magenta">{figureSet.pointer}</Text>
						) : (
							<Text> </Text>
						)}
						<Text>{` ${travelItem.date} - (${travelItem.items.length} ${pluralize('package', travelItem.items.length)})`}</Text>
						{travelItem.isSelected ? <SelectedText /> : null}
					</Box>
				);
			}, travelItems)}
			<Box marginLeft={2} marginTop={1}>
				<Text bold color="#800080" backgroundColor="#ffffff">
					{wrasp('Revert')}
				</Text>
				{travelStatus === 'SUCCEEDED' ? (
					<SuccessText
						spaces
						text="Package.json has been changed. You need to issue install command yourself."
					/>
				) : null}
			</Box>
		</Box>
	);
}
