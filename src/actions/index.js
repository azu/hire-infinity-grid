import store from "../store";

const setViewportRect = (rect) => (dispatch, getState) => {
	dispatch({
		type: "SET_VIEWBOX_RECT",
		viewBox: [getState().grid.viewBox[0], getState().grid.viewBox[1], Math.floor(rect.width) - 2, Math.floor(rect.height) - 2],
		domPos: {x: rect.left, y: rect.top}
	});
};

const moveViewport = (movement) => (dispatch, getState) => {
	const newX = getState().grid.viewBox[0] + movement.x;
	const newY = getState().grid.viewBox[1] + movement.y;
	dispatch({
		type: "SET_VIEWBOX_RECT",
		viewBox: [newX, newY, getState().grid.viewBox[2], getState().grid.viewBox[3]],
		domPos: getState().grid.domPos

	});
};

const moveComponent = (movement, idx) => (dispatch) => {
	dispatch({
		type: "MOVE_COMPONENT",
		movement: movement,
		idx: idx
	});
};

const setComponentProps = (props, idx) => (dispatch) => {
	dispatch({
		type: "SET_COMPONENT_PROPS",
		idx: idx,
		props: props
	});
};

const selectComponent = (idx) => (dispatch, getState) => {
	const unsubscribe = store.subscribe(() => {
		unsubscribe();
		getState().grid.components[idx].props.onSelect(idx, getState().grid.components[idx].props);
	});

	const sel = getState().grid.components.map((c, i) => [c, i]).filter((cc) => cc[0].props.selected && !cc[0].props.deleted );
	if(sel.length) {
		sel[0][0].props.onDeselect(sel[0][1], sel[0][0].props, (props) => {
			store.dispatch(setComponentProps(props, sel[0][1]));
		});
	}

	dispatch({
		type: "SELECT_COMPONENT",
		idx: idx
	});
};

const addComponent = (component, spec) => (dispatch, getState) => {
	const unsubscribe = store.subscribe(() => {
		unsubscribe();
		store.dispatch(selectComponent(getState().grid.components.length - 1));
	});

	dispatch({
		type: "ADD_COMPONENT",
		x: getState().grid.viewBox[0] + spec.x,
		y: getState().grid.viewBox[1] + spec.y,
		props: spec.props,
		component: component
	});
};


export default {
	onResize: (value) => store.dispatch(setViewportRect(value)),
	onDrag: (movement) => store.dispatch(moveViewport(movement)),
	onDragComponent: (movement, idx) => store.dispatch(moveComponent(movement, idx)),
	onSetComponentProps: (props, idx) => store.dispatch(setComponentProps(props, idx)),
	onAddComponent: (component, pos) => store.dispatch(addComponent(component, pos)),
	onSelectComponent: (idx, next) => store.dispatch(selectComponent(idx, next))
};