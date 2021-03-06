/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */

/**
 * A route path ParamComponent
 * 
 * @typedef {Object} RoutePathComponent
 * @property {string} type - the type of the component, either 'param' or 'path'
 * @property {string} name - type name of the component. For param, it is the name of the query variable and of the resulting property in the param object; for path it is literal text of the path component.
 * 
 */

/**
 * A definition of path and parameters which may match a route, and a payload.
 * 
 * @typedef {Object} RouteSpecification
 * @property {Array.<String|RoutePathComponent>} path - an array of path elements, either literal strings or path component objects
 * @property {Object} params - an object whose properties are parameters may be present in a query string
 * @property {Object} payload - an arbitrary object which represents the state associated with the route path.
 */

/** 
 * A simple hash-path router service.
 * 
 * @module router
 * 
 * 
 * @returns {unresolved}
 */
define([], function () {
    'use strict';
    function factory(config) {
        // Routing
        var routes = [],
                defaultRoute = config.defaultRoute,
                notFoundRoute = config.notFoundRoute;

        if (!defaultRoute) {
            throw new Error('The defaultRoute must be provided');
        }
        if (!notFoundRoute) {
            throw new Error('The notFound route must be provided');
        }

        function addRoute(pathSpec) {
            /*
             * The path spec is an array of elements. Each element is either a
             * string, in which case it is a literal path component, 
             * regular expression, which case it is matched on a path component,
             * object with type:param
             */
            /* TODO: do something on overlapping routes */
            /* TODO: better mapping method for routes. */
            /* still, with a relatively short list of routes, this is far from a performance issue. */
            routes.push(pathSpec);
        }

        function parseQueryString(s) {
            var fields = s.split(/[\?\&]/),
                    params = {};
            fields.forEach(function (field) {
                if (field.length > 0) {
                    var pair = field.split('=');
                    if (pair[0].length > 0) {
                        params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
                    }
                }
            });
            return params;
        }

        function getCurrentRequest() {
            var path = [],
                    query = {},
                    hash, pathQuery;

            // The path is (for now) from the hash component.
            if (window.location.hash && window.location.hash.length > 1) {
                hash = window.location.hash.substr(1);
                pathQuery = hash.split('?', 2);

                if (pathQuery.length === 2) {
                    query = parseQueryString(pathQuery[1]);
                }
                path = pathQuery[0].split('/').filter(function (x) {
                    return (x.length > 0);
                });
            }

            return {
                path: path,
                query: query
            };
        }


        function findRoute(req) {
            var foundRoute, i, j, route, params, found, elValue, elType, allowableParams;
            if ((req.path.length === 0) && (Object.keys(req.query).length === 0)) {
                return {
                    request: req,
                    params: {},
                    route: defaultRoute
                };
            }
            for (i = 0; i < routes.length; i += 1) {
                route = routes[i];
                if (route.path.length !== req.path.length) {
                    continue;
                }
                params = {};
                found = true;
                for (j = 0; j < req.path.length; j += 1) {
                    elValue = route.path[j];
                    elType = typeof elValue;
                    if (elType === 'string' && elValue !== req.path[j]) {
                        found = false;
                        break;
                    }
                    if (elType === 'object' && elValue.type === 'param') {
                        params[elValue.name] = req.path[j];
                    }
                }
                if (found) {
                    foundRoute = {
                        request: req,
                        params: params,
                        route: route
                    };
                    break;
                }
            }
            // The total params is the path params and query params
            if (foundRoute) {
                allowableParams = foundRoute.route.queryParams || {};
                Object.keys(req.query).forEach(function (key) {
                    var paramDef = allowableParams[key];
                    /* TODO: implement the param def for conversion, validation, etc. */
                    if (paramDef) {
                        foundRoute.params[key] = req.query[key];
                    }
                });
            } else {
                return {
                    request: req,
                    params: {},
                    route: notFoundRoute
                };
            }
            return foundRoute;
        }
        function findCurrentRoute() {
            var req = getCurrentRequest();
            return findRoute(req);
        }

        function listRoutes() {
            return routes.map(function (route) {
                return route.path;
            });
        }


        // TODO: move this stuff to router?
        /**
         * A simple adapter to trigger a routing event for the current
         * browser hash-path.
         * 
         * @returns {undefined}
         */

        function paramsToQuery(params) {
            return Object.keys(params).map(function (key) {
                return key + '=' + encodeURIComponent(params[key]);
            }).join('&');
        }

        function navigateTo(location) {
            //if (window.history.pushState) {
            //    window.history.pushState(null, '', '#' + location);
            //} else {
            if (typeof location === 'string') {
                location = {path: location};
            }
            // path may be an array.
            var loc;
            if (location.path.pop) {
                loc = location.path.join('/');
            } else {
                loc = location.path;
            }
            if (location.params) {
                loc += '?' + paramsToQuery(location.params);
            }
            window.location.hash = '#' + loc;
            //}
        }
        function replacePath(location) {
            window.location.replace(location);
        }
        function redirectTo(location, newWindow) {
            if (newWindow) {
                window.open(location);
            } else {
                window.location.replace(location);
            }
        }

        return {
            addRoute: addRoute,
            listRoutes: listRoutes,
            findCurrentRoute: findCurrentRoute,
            getCurrentRequest: getCurrentRequest,
            findRoute: findRoute,
            navigateTo: navigateTo,
            redirectTo: redirectTo
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});