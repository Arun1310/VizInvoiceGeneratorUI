const parseFromValuesOrFunc = (fn, arg) => (fn instanceof Function ? fn(arg) : fn);
export const getValueAndLabel = (option) => {
	let label = '';
	let value = '';

	if (option) {
		if (typeof option !== 'object') {
			label = option;
			value = option;
		} else {
			label = option.label ?? option.text ?? option.value;
			value = option.value ?? label;
		}
	}

	return { label, value };
};
export default parseFromValuesOrFunc;
