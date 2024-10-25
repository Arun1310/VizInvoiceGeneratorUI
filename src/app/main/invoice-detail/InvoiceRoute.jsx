import i18next from 'i18next';
import { lazy } from 'react';
import en from './i18n/en';
import tr from './i18n/tr';
import ar from './i18n/ar';

i18next.addResourceBundle('en', 'home', en);
i18next.addResourceBundle('tr', 'home', tr);
i18next.addResourceBundle('ar', 'home', ar);
const InvoiceDetail = lazy(() => import('./InvoiceDetail'));

const InvoiceRoute = {
	path: 'invoice/:id',
	element: <InvoiceDetail />
};
export default InvoiceRoute;
