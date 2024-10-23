import FuseLayoutConfig from './FuseLayoutConfig';

function FuseLayoutConfigs(props) {
	const { value, prefix, control } = props;
	return Object?.entries?.(value)?.map?.(([key, item]) => {
		const name = prefix ? `${prefix}.${key}` : key;
		return (
			<FuseLayoutConfig
				key={key}
				name={name}
				control={control}
				item={item}
			/>
		);
	});
}

export default FuseLayoutConfigs;
