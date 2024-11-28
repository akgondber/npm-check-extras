import React from 'react';
import {Text} from 'ink';
import figureSet from 'figures';

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

export {SuccessText, ErrorText};
