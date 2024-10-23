import FuseScrollbars from '@fuse/core/FuseScrollbars';

/**
 * The FusePageCardedSidebarContent component is a content container for the FusePageCardedSidebar component.
 */
function FusePageCardedSidebarContent(props) {
	const { innerScroll, children } = props;

	if (!children) {
		return null;
	}

	return (
		<FuseScrollbars enable={innerScroll}>
			<div className="FusePageCarded-sidebarContent min-w-320 lg:min-w-0">{children}</div>
		</FuseScrollbars>
	);
}

export default FusePageCardedSidebarContent;
