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

function merge(a: Object, b: Object) {
  // eslint-disable-next-line prefer-const
  let { className, style, ...rest } = a;
  const { className: bClassName, style: bStyle, ...bRest } = b;
  // merge className props
  if (bClassName) {
    className = className ? `${className} ${bClassName}` : bClassName;
  }
  // merge style props
  if (bStyle && typeof bStyle === 'object') {
    style = style ? { ...style, ...bStyle } : bStyle;
  }
  return { className, style, ...rest, ...bRest };
}

export function mergeClassNameAndStyle(...objs: Object[]) {
  return objs.reduce(merge);
}

export default function mergePropSetters<T: Function>(...fns: T[]): Function {
  return (...args) =>
    fns
      .map(fn => fn(...args))
      .filter(Boolean)
      .reduce(merge);
}
