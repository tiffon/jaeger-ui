// @flow

// Copyright (c) 2018 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import DagNode from './DagNode';

import type { NodeID, PEdge, PVertex } from './types';

export default function convPlexus<T>(nodesMap: Map<NodeID, DagNode<T>>) {
  const vertices: PVertex<T>[] = [];
  const edges: PEdge[] = [];
  const ids = [...nodesMap.keys()];
  const keyMap: Map<string, ?number> = new Map(ids.map((id: NodeID, i: number) => [id, i]));
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const dagNode = nodesMap.get(id);
    if (!dagNode) {
      // should not happen, keep flow happy
      continue;
    }
    vertices.push({
      key: i,
      label: `${dagNode.count} | ${dagNode.operation}`,
      data: dagNode,
    });
    const parentKey = dagNode.parentID && keyMap.get(dagNode.parentID);
    if (parentKey == null) {
      continue;
    }
    edges.push({
      from: parentKey,
      to: i,
    });
  }
  return { edges, vertices };
}
