// Copyright (c) 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React, { Component } from 'react';
import createHistory from 'history/createBrowserHistory';
import { Provider } from 'react-redux';
import { Route, Redirect, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';

import 'semantic-ui-css/semantic.min.css';

import Page from './Page';
import NotFound from './NotFound';
import { ConnectedDependencyGraphPage } from '../DependencyGraph';
import { ConnectedSearchTracePage } from '../SearchTracePage';
import { ConnectedTracePage } from '../TracePage';
import { fetchConfig } from '../../actions/jaeger-api';
import JaegerAPI, { DEFAULT_API_ROOT } from '../../api/jaeger';
import configureStore from '../../utils/configure-store';
import prefixUrl from '../../utils/prefix-url';

import './App.css';

const history = createHistory();

export default class JaegerUIApp extends Component {
  constructor(props) {
    super(props);
    this.store = configureStore(history);
    JaegerAPI.apiRoot = DEFAULT_API_ROOT;
    this.store.dispatch(fetchConfig());
  }

  render() {
    return (
      <Provider store={this.store}>
        <ConnectedRouter history={history}>
          <Page>
            <Switch>
              <Route path={prefixUrl('/search')} component={ConnectedSearchTracePage} />
              <Route path={prefixUrl('/trace/:id')} component={ConnectedTracePage} />
              <Route path={prefixUrl('/dependencies')} component={ConnectedDependencyGraphPage} />
              <Redirect exact path="/" to={prefixUrl('/search')} />
              <Redirect exact path={prefixUrl()} to={prefixUrl('/search')} />
              <Redirect exact path={prefixUrl('/')} to={prefixUrl('/search')} />
              <Route component={NotFound} />
            </Switch>
          </Page>
        </ConnectedRouter>
      </Provider>
    );
  }
}
