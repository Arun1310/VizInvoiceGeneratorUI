import i18next from 'i18next';
import ar from './navigation-i18n/ar';
import en from './navigation-i18n/en';
import tr from './navigation-i18n/tr';

i18next.addResourceBundle('en', 'navigation', en);
i18next.addResourceBundle('tr', 'navigation', tr);
i18next.addResourceBundle('ar', 'navigation', ar);
/**
 * The navigationConfig object is an array of navigation items for the Fuse application.
 */
const navigationConfig = [
	{
		id: 'home-component',
		title: 'Home',
		translate: 'HOME',
		type: 'item',
		icon: 'heroicons-outline:home',
		url: 'home',
		end: true
	},
	// {
	// 	id: 'invoice-component',
	// 	title: 'Invoice',
	// 	translate: 'Invoice',
	// 	type: 'item',
	// 	icon: 'heroicons-outline:home',
	// 	url: 'invoice',
	// 	end: true
	// }
];
export default navigationConfig;
