import { styled } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import clsx from 'clsx';

const FuseTabs = styled((props) => (
	<Tabs
		indicatorColor="secondary"
		textColor="inherit"
		variant="scrollable"
		scrollButtons={false}
		className={clsx('w-full min-h-0', props.className)}
		classes={{
			indicator: 'flex justify-center bg-transparent w-full h-full'
		}}
		TabIndicatorProps={{
			children: (
				<Box
					sx={{ bgcolor: 'text.disabled' }}
					className="w-full h-full rounded-lg opacity-20"
				/>
			)
		}}
		{...props}
	/>
))(() => ({
	minHeight: 36,
	'& .MuiTabs-flexContainer': {
		height: 36
	},
	'& .MuiTab-root:not(:last-of-type)': {
		marginRight: 4
	}
}));
export default FuseTabs;
