export const layoutConfigOnlyMain = {
	config: {
		navbar: {
			display: false
		},
		toolbar: {
			display: false
		},
		footer: {
			display: false
		},
		leftSidePanel: {
			display: false
		},
		rightSidePanel: {
			display: false
		}
	}
};
export const layoutConfigOnlyMainFullWidth = {
	config: {
		...layoutConfigOnlyMain.config,
		mode: 'fullwidth'
	}
};
export const layoutNoContainer = {
	config: {
		mode: 'fullwidth'
	}
};
