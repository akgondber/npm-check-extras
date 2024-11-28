import React from 'react';
import {Text, Box} from 'ink';
import * as R from 'ramda';
import figureSet from 'figures';
import type {HistoryData, OperationItem} from '../types.js';

function OperationsHistory({data}: {readonly data: HistoryData}) {
	return (
		<Box flexDirection="column">
			<Text>
				<Text bold>{figureSet.arrowUp}</Text> and{' '}
				<Text bold>{figureSet.arrowDown}</Text> to go to next/previous page
			</Text>
			<Text>
				Page: {data.page} of {Math.ceil(data.items.length / data.limit)}
			</Text>
			<Box flexDirection="column">
				{R.map(
					(item: OperationItem) => {
						return (
							<Box key={item.id} alignItems="center">
								<Text>{`[${item.date}] `}</Text>
								<Text> </Text>
								<Text bold color="cyan">
									{item.name}
								</Text>
								<Text>{' ('}</Text>
								<Text italic>{item.operation}</Text>
								<Text>{') '}</Text>
								<Text color="yellow">{figureSet.arrowRight}</Text>
								<Text> </Text>
								<Text>{item.command}</Text>
							</Box>
						);
					},
					data.items.slice(
						(data.page - 1) * data.limit,
						data.page * data.limit,
					),
				)}
			</Box>
		</Box>
	);
}

export default OperationsHistory;
