import React from 'react';
import {Text} from 'ink';
import figureSet from 'figures';

type TextItem = {
	readonly text?: string;
	readonly spaces?: boolean;
};

function SuccessText({text, spaces}: TextItem) {
	return (
		<Text>
			{spaces ? <Text>{'  '}</Text> : null}
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

function SelectedText({text}: TextItem) {
	return (
		<Text>
			<Text color="green"> {figureSet.tick}</Text>
			{text}
		</Text>
	);
}

export {SuccessText, ErrorText, SelectedText};
