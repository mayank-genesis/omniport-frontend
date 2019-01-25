import React, { Component, Suspense } from 'react'
import { Switch, Route, BrowserRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import Loading from 'formula_one/src/components/loading'
import { NoMatch } from 'formula_one'
import { setAppList } from 'core/common/src/actions/appList'

import configs from './configs.json'

/*
 This is the entry point for Omniport
*/

class App extends Component {
  componentDidMount () {
    this.props.setAppList()
  }

  render () {
    const { appList } = this.props
    return (
      <Suspense fallback={Loading}>
        <BrowserRouter>
          <Switch>
            {configs.services.map((service, index) => {
              return (
                <Route
                  path={service.baseUrl}
                  key={index}
                  component={React.lazy(() =>
                    import(`services/${service.source}`)
                  )}
                />
              )
            })}
            {appList.isLoaded &&
              appList.data.map((app, index) => {
                return (
                  <Route
                    path={app.baseUrl}
                    key={index}
                    component={React.lazy(() => import(`apps/${app.source}`))}
                  />
                )
              })}

            {/* Default 404 page */}
            {appList.isLoaded && <Route component={NoMatch} />}
          </Switch>
        </BrowserRouter>
      </Suspense>
    )
  }
}

const mapStateToProps = state => {
  return {
    appList: state.appList
  }
}

export default connect(
  mapStateToProps,
  { setAppList }
)(App)