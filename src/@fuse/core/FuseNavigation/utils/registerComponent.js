import components from './components';
/**
 * Register a component to FuseNavItem.
 */
export function registerComponent(name, Component) {
	components[name] = Component;
}
