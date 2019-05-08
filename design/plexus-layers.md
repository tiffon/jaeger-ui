# Plexus layers

## Goals

Currently, the output for plexus is quite restrictive in that you get SVG `<path>` edges and `HTMLElement` nodes, with the node layer above the edges layer, in the final graph.

The proposed changes to plexus allow greater flexibility for how graph elements are specified.

* Nodes and edges are specified as layers within the graph
* There can be any number of layers for nodes or edges
* The layers can be in any order
* Nodes and edges can be either `HTMLElement`s or `SVGElement`s
* Nodes and edges have access to the transformation state of the graph, which is to say the zoom, pan, etc.
* The `markerEnd` for `<path>` edges can now be specified
* Specifying props that do not change, per vertex or edge, is more concise

## Proposal

The following two grouping components are introduced:

* `SvgScope` - This creates an `<svg>` into which nodes, edges and / or `<marker>`s can be rendered
* `HtmlScope` - This creates a `<div>` into which nodes and / or edges can be rendered

These grouping components can contain any number of node or edge rendering components:

* `EdgesLayer` - This allows for edges to be rendered
* `NodesLayer` - This allows for nodes to be rendered

Lastly, `SvgScope`, only, can also contain:

* `ArrowMarkerDef` - These define `<marker>` `SVGElements` to be used as `markerStart` or `markerEnd` attribute values on `<path>`s

## Example

A bit of set up:

```js
function setOnNode() {
  return { style: { outline: 'inherit' }};
}
```

The existing API:

```jsx
<DirectedGraph
  minimap
  zoom
  arrowScaleDampener={0.8}
  className="DdgGraph"
  minimapClassName="u-plexusMiniMap"
  layoutManager={this.layoutManager}
  getNodeLabel={getNodeRenderer(findMatches)}
  setOnRoot={classNameIsSmall}
  setOnEdgesContainer={scaleOpacity}
  setOnNodesContainer={setOnNodesContainer}
  setOnNode={setOnNode}
  edges={edges}
  vertices={vertices}
/>
```

An equivalent graph with the proposed API:

```jsx
<DirectedGraph
  minimap
  zoom
  className="DdgGraph"
  minimapClassName="u-plexusMiniMap"
  layoutManager={this.layoutManager}
  setOnRoot={classNameIsSmall}
  edges={edges}
  vertices={vertices}
>
  <SvgScope>
    <ArrowMarkerDef scaleDampener={0.8} />
    <EdgesLayer setOnContainer={scaleOpacity} markerEnd />
  </SvgScope>
  <HtmlScope>
    <NodesLayer
      sizeProvider
      render={getNodeRenderer(findMatches)}
      setOnContainer={setOnNodesContainer}
      style={{ outline: 'inherit' }}
    />
  </HtmlScope>
</DirectedGraph>
```

And, with annotations:

```jsx
<DirectedGraph
  // Everything still in here is unchanged
  minimap
  zoom
  className="DdgGraph"
  minimapClassName="u-plexusMiniMap"
  layoutManager={this.layoutManager}
  setOnRoot={classNameIsSmall}
  edges={edges}
  vertices={vertices}
>
  {/* Start a new <svg> in the graph */}
  <SvgScope>
    {/* Add a <def><marker>{ etc... }</marker></def> to use as a markerEnd.
        This ArrowMarkerDef uses the default local ID, which is unique within a
        `<DirectedGraph>` instance. */}
    <ArrowMarkerDef
      // The scaleDampener is an existing attribute to manage the arrow heads when scaling.
      scaleDampener={0.8}
    />
    {/* Add a `<g>` to the parent `<svg>` and render edges within it. A `render`
        prop is not specified, so the default renderer is used. */}
    <EdgesLayer
      // The `markerEnd` attribute, as an implied `true`, indicates the `markerEnd` should be
      // applied to the edges with the default local ID for `ArrowMarkerDef`s.
      markerEnd
      // `setOnContainer`, in this case, is similar to the `setOnEdgesContainer` prop from the
      // existing API.
      setOnContainer={scaleOpacity}
    />
  </SvgScope>
  {/* Start a new <div> in the graph */}
  <HtmlScope>
    {/* Add a `<div>` to the parent `<div>` and render nodes within it. */}
    <NodesLayer
      // `sizeProvider` indicates this layer can render nodes a) without knowing
      // the final size of the nodes or where they will eventually be positioned
      // and b) the nodes in this layer can, in fact, be measured to establish
      // the final width and height of the nodes. Every graph requires a single
      // `NodesLayer` which is marked with the sizeProvider boolean prop.
      sizeProvider
      // More details, below, but this is very similar to the `getNodeLabel` prop
      // in the current API.
      render={getNodeRenderer(findMatches)}
      // Similar to the `setOnNodesContainer` prop in the current API. This can
      // be used to set things like className, etc., on the `<div>` wrapping
      // the nodes rendered in this layer.
      setOnContainer={setOnNodesContainer}
      // For our example graph, this extra prop replaces the `setOnNode` prop
      // from the current API. All extra props are simply passed onto the items.
      style={{ outline: 'inherit' }}
      // Alternatively, we could have used the following, which would set the
      // style as well.
      setOnItem={setOnNode}
    />
  </HtmlScope>
</DirectedGraph>
```

## Multiple layers

```jsx
// Add a CSS class and use the right arrow if the edge is hovered
// or marked for emphasis
function setOnEdge(edge, _, renderUtils) {
  if (edge.uxStatus & UxStatus.Hover) {
    return {
      // this className will be merged with the className from the <EdgesLayer>
      className: 'is-hovered',
      markerEnd: renderUtils.getLocalId('hoveredArrow'),
    }
  }
  if (edge.uxStatus & UxStatus.Mark) {
    return {
      // this className will be merged with the className from the <EdgesLayer>
      className: 'is-marked',
      markerEnd: renderUtils.getLocalId('markedArrow'),
    }
  }
  return null;
}

<DirectedGraph
  className="DdgGraph"
  minimapClassName="u-plexusMiniMap"
  layoutManager={this.layoutManager}
  setOnRoot={classNameIsSmall}
  edges={edges}
  vertices={vertices}
>
  <SvgScope>
    <ArrowMarkerDef
      // Uses the default local ID for the marker end
      className="Ddg--edgeMarkerEnd"
      scaleDampener={0.8}
    />
    <ArrowMarkerDef
      localId="hoveredArrow"
      className="Ddg--edgeMarkerEnd is-hovered"
      scaleDampener={0.8}
    />
    <ArrowMarkerDef
      className="Ddg--edgeMarkerEnd is-marked"
      localId="markedArrow"
      scaleDampener={0.8}
    />
    <NodesLayer render={renderNodeOutline} />
    <EdgesLayer markerEnd className="DdgGraph--edge" setOnItem={setOnEdge} setOnContainer={scaleOpacity} />
    <EdgesLayer className="DdgGraph--edgePointerArea" onMouseOver={console.log} />
  </SvgScope>
  <HtmlScope>
    <NodesLayer isMeasurable render={renderNode} />
  </HtmlScope>
</DirectedGraph>
```

## Graph transform data

The current state of the view.

```js
type TGraphTransform = {
  k: number,
  vh: number,
  vw: number,
  x: number,
  y: number,
};

const graphTransformIdentity = {
  k: 1,
  vh: 1,
  vw: 1,
  x: 1,
  y: 1,
};

const GraphTransformContext = React.createContext(graphTransformIdentity);
```

This is available to the render functions either through a getter function, which means it can be considered when rendering the components, or via context, which means changes in the graph can trigger re-renders.

### GraphTransformContext

The transform of the graph is available through the `GraphTransformContext` context:

```jsx
function Node(props) {
  const
  return (
    <GraphTransformContext.Consumer>
      {transform => (
        <div>
          The transform: {JSON.stringify(transform)}
        </div>
      )}
    </GraphTransformContext.Consumer>
  );
}
```

## Render function signatures

```ts
type TRendererUtils = {
  getLocalId: (idPostfix: string) => string;
  getGraphTransform: () => TGraphTransform;
};
```

### Node renderer

```ts
type NodeRenderer = (vertex: TVertex, layoutVertex: TLayoutVertex | null, utils: TRendererUtils) => React.ReactNode;
```

Note the renderer is now also being passed `TLayoutVertex` as an optional second argument. This allows other, non-primary, renderings of the node to know the primary dimensions and position of the node.

`utils.getGraphTransform` returns the _current_ graph transform. The function does not, itself, change and therefore updates to the graph's transform will not cause re-renders of the nodes (or edges).

The `NodeResilientToSmallScale` example is a node that shows itself in a popover, on hover, if the graph is zoomed out. The popover shows the node at full-size. When the view is not zoomed out the popover is not shown.

```jsx
const POPOVER_VISIBILITY_MAX_SCALE = 0.85;

type TProps = {
  getGraphTransform: () => TGraphTransform,
  // etc...
}

export class NodeResilientToSmallScale extends React.PureComponent<TProps> {
  state = { showPopover: false };

  onPreVisibilityChanged = visibility => {
    if (visibility) {
      const { getGraphTransform } = this.props;
      const showPopover = getGraphTransform().k < POPOVER_VISIBILITY_MAX_SCALE;
      if (showPopover !== this.state.showPopover) {
        this.setState({ showPopover });
      }
    } else {
      this.setState({ showPopover: false });
    }
  };

  render() {
    const nodeContent = (
      <div>
        // etc...
      </div>
    );
    return (
      <Popover onVisibleChange={this.onPreVisibilityChanged} content={nodeContent}>
        {nodeContent}
      </Popover>
    );
  }
}

function renderNode(vertex: TVertex, getGraphTransform: () => TGraphTransform) {
  return <NodeResilientToSmallScale getGraphTransform={getGraphTransform} vertex={vertex} />;
}
```
