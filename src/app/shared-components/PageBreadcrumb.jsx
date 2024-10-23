import { useMatches, Link } from 'react-router-dom';
import { useAppSelector } from 'app/store/hooks';
import { selectNavigation } from 'app/theme-layouts/shared-components/navigation/store/navigationSlice';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';

// Function to get the navigation item based on URL
function getNavigationItem(url, navigationItems) {
	for (let i = 0; i < navigationItems.length; i += 1) {
		const item = navigationItems[i];

		if (item.url === url) {
			return item;
		}

		if (item.children) {
			const childItem = getNavigationItem(url, item.children);

			if (childItem) {
				return childItem;
			}
		}
	}
	return null;
}

function PageBreadcrumb(props) {
	const { className, ...rest } = props;
	const matches = useMatches();
	const navigation = useAppSelector(selectNavigation);
	const crumbs = matches.reduce((acc, match) => {
		if (!match.pathname) return acc;

		const { pathname } = match;
		let title = 'Home';

		if (pathname !== '/') {
			const navItem = getNavigationItem(pathname, navigation);
			title = navItem?.title || pathname.split('/').pop() || '';
		}

		acc.push({
			title,
			url: pathname
		});
		return acc;
	}, []);
	return (
		<Breadcrumbs
			className={clsx('flex w-full', className)}
			aria-label="breadcrumb"
			color="primary"
			{...rest}
		>
			{crumbs.map(
				(item, index) =>
					item?.title !== '' && (
						<Typography
							component={item?.url ? Link : 'span'}
							to={item?.url}
							key={index}
							className="block font-medium tracking-tight capitalize max-w-128 truncate"
							role="button"
						>
							{item?.title}
						</Typography>
					)
			)}
		</Breadcrumbs>
	);
}

export default PageBreadcrumb;
