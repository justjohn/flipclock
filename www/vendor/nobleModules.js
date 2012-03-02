// Copyright © 2011 Barnesandnoble.com llc
// Released under the MIT License (see MIT-LICENSE.txt).

(function (global, undefined) {
    var TERM_DELIMITER = "/";
    var CURRENT_DIRECTORY = ".";
    var PARENT_DIRECTORY = "..";
    var MODULE_FILE_EXTENSION = ".js";

    var EXTRA_MODULE_ENVIRONMENT_MODULE_ID = undefined;
    var EXTRA_MODULE_ENVIRONMENT_MODULE_DEPENDENCIES = [];

    var MAIN_MODULE_ID = "";            // Browser environment: main module's identifier should be the empty string.
    var DEFAULT_MAIN_MODULE_DIR = "";   // Browser environment: paths are relative to main module path, i.e. path of
                                        // HTML file that does initial module.declare.

    var DEFAULT_DEBUG_OPTIONS = { disableCaching: false, warnAboutUndeclaredDependencies: false };

    // Set via require("nobleModules").setDebugOptions(options). Reset to default by require("nobleModules").reset().
    // Or do both at once via require("nobleModules").reset({ withDebugOptions: options }).
    var debugOptions;

    // Defaults to DEFAULT_MAIN_MODULE_DIR, but can be changed during a reset via
    // require("nobleModules").reset({ mainModuleDirectory: newMainModuleDir }).
    var mainModuleDir;

    // An id => object map giving each module's exports. Filled lazily upon first require of a given module.
    var exportsMemo = createMap();

    // An id => object map giving each module's "module" variable that is passed to the factory function.
    var moduleObjectMemo = createMap();

    // An id => { moduleFactory, dependencies, exports } map that has an entry when a module is currently memoized, 
    // but hasn't yet been required by anyone. Exports is added when module is initialized; it is same reference that 
    // is passed to the module factory function, and is stored here to prevent circular dependency recursion when 
    // multiple calls to require are made while initialization of the module is still in progress. Requiring a module 
    // will remove its entry from here and move the exports to exportsMemo.
    var pendingDeclarations = createMap();

    // The global instances of require and module are stored here and returned in getters, so that we can use 
    // Object.defineProperties(global, ...) to prevent users from overwriting global.require and global.module, but 
    // still reset them ourselves in the reset function.
    var globalRequire;
    var globalModule;

    ///#region Helper functions and objects
    var warn = (global.console && global.console.warn) ? function (warning) { global.console.warn(warning); }
                                                       : function () { };

    function getUriFromId(id) {
        var prefix = mainModuleDir ? mainModuleDir + TERM_DELIMITER : "";
        return prefix + id + MODULE_FILE_EXTENSION;
    }

    function createMap() {
        var hash = {};

        return {
            containsKey: function (lookupKey) {
                return Object.prototype.hasOwnProperty.call(hash, lookupKey);
            },
            get: function (lookupKey) {
                if (!Object.prototype.hasOwnProperty.call(hash, lookupKey)) {
                    throw new Error('Could not find entry with key "' + lookupKey + '".');
                }
                return hash[lookupKey];
            },
            set: function (lookupKey, data) {
                hash[lookupKey] = data;
            },
            remove: function (lookupKey) {
                delete hash[lookupKey];
            },
            empty: function () {
                hash = {};
            },
            keys: function () {
                return Object.keys(hash);
            }
        };
    }

    function createSet() {
        var hash = {};

        return {
            contains: function (value) {
                return Object.prototype.hasOwnProperty.call(hash, value);
            },
            add: function (value) {
                hash[value] = true;
            },
            remove: function (value) {
                delete hash[value];
            },
            empty: function () {
                hash = {};
            },
            values: function () {
                return Object.keys(hash);
            }
        };
    }

    function createListenerCollection() {
        var listeners = createMap();

        return {
            empty: listeners.empty,
            add: function (key, listener) {
                if (listeners.containsKey(key)) {
                    listeners.get(key).push(listener);
                } else {
                    listeners.set(key, [listener]);
                }
            },
            trigger: function (key) {
                if (listeners.containsKey(key)) {
                    listeners.get(key).forEach(function (listener) {
                        listener();
                    });
                    listeners.remove(key);
                }
            }
        };
    }

    function createCallbackAggregator(numberOfCallbacks, onAllCompleted) {
        var numberOfCallbacksSoFar = 0;

        return function () {
            if (++numberOfCallbacksSoFar === numberOfCallbacks) {
                onAllCompleted();
            }
        };
    }

    var dependencyTracker = (function () {
        var dependencyArrays = createMap();
        var dependencyIdArraysMemo = createMap();

        function getIdFromPath(path) {
            var idFragments = [];
            path.split(TERM_DELIMITER).forEach(function (pathFragment) {
                if (pathFragment === CURRENT_DIRECTORY || pathFragment.length === 0) {
                    return;
                }

                if (pathFragment === PARENT_DIRECTORY) {
                    if (idFragments.length === 0) {
                        throw new Error("Invalid module path: " + path);
                    }
                    idFragments.pop();
                    return;
                }

                idFragments.push(pathFragment);
            });

            var id = idFragments.join(TERM_DELIMITER);
            if (id.length === 0) {
                throw new Error("Could not create an ID from the path passed in: " + path);
            }
            return id;
        }

        function getDirectoryPortion(moduleId) {
            if (moduleId === MAIN_MODULE_ID || moduleId === EXTRA_MODULE_ENVIRONMENT_MODULE_ID) {
                return "";
            }

            var directoryPortion = moduleId.split(TERM_DELIMITER).slice(0, -1).join(TERM_DELIMITER);

            // If empty, return the current directory string, so as to distinguish from empty string.
            // Empty string would denote relative to the HTML file that we are inserting <script /> tags into.
            return directoryPortion || CURRENT_DIRECTORY;
        }

        function getIdFromStringIdentifier(relativeModuleDir, moduleIdentifier) {
            if (moduleIdentifier === MAIN_MODULE_ID) {
                return MAIN_MODULE_ID;
            }

            var path;
            if (moduleIdentifier.indexOf(CURRENT_DIRECTORY + TERM_DELIMITER) === 0 ||
                moduleIdentifier.indexOf(PARENT_DIRECTORY + TERM_DELIMITER) === 0) {
                path = relativeModuleDir + TERM_DELIMITER + moduleIdentifier;
            } else {
                path = TERM_DELIMITER + moduleIdentifier;
            }
            return getIdFromPath(path);
        }

        function makeLabelsToIdsMap(moduleDir, dependencies) {
            var map = createMap();

            dependencies
                .filter(function (dependency) { return typeof dependency === "object"; })
                .forEach(function (labeledDependencyObject) {
                    Object.keys(labeledDependencyObject).forEach(function (label) {
                        var identifier = labeledDependencyObject[label];
                        map.set(label, getIdFromStringIdentifier(moduleDir, identifier));
                    });
                });

            return map;
        }

        function isValidDependencyIdentifier(identifier) {
            return typeof identifier === "string";
        }

        function isValidLabeledDependencyObject(object) {
            return typeof object === "object" && Object.keys(object).every(isValidDependencyIdentifier);
        }

        function isValidDependencyArrayEntry(arrayEntry) {
            return isValidDependencyIdentifier(arrayEntry) || isValidLabeledDependencyObject(arrayEntry);
        }

        function getDependenciesFor(id) {
            return id === EXTRA_MODULE_ENVIRONMENT_MODULE_ID ? EXTRA_MODULE_ENVIRONMENT_MODULE_DEPENDENCIES
                                                             : dependencyArrays.get(id);
        }

        return {
            reset: function () {
                dependencyArrays.empty();
                dependencyIdArraysMemo.empty();
            },
            setDependenciesFor: function (id, dependencies) {
                // Note: this method is never called for id === EXTRA_MODULE_ENVIRONMENT_ID,
                // so we don't need to handle that case
                dependencyArrays.set(id, dependencies);
            },
            getDependenciesCopyFor: function (id) {
                return getDependenciesFor(id).slice();
            },
            getDependencyIdsFor: function (id) {
                if (id === EXTRA_MODULE_ENVIRONMENT_MODULE_ID) {
                    return EXTRA_MODULE_ENVIRONMENT_MODULE_DEPENDENCIES;
                }

                if (!dependencyIdArraysMemo.containsKey(id)) {
                    dependencyIdArraysMemo.set(id, dependencyTracker.transformToIdArray(getDependenciesFor(id), id));
                }

                return dependencyIdArraysMemo.get(id);
            },
            isValidArray: function (dependencies) {
                return dependencies.every(isValidDependencyArrayEntry);
            },
            transformToIdArray: function (dependencies, baseModuleId) {
                var moduleDir = getDirectoryPortion(baseModuleId);

                var ids = [];
                function pushId(identifier) {
                    ids.push(getIdFromStringIdentifier(moduleDir, identifier));
                }

                dependencies.forEach(function (dependency) {
                    if (typeof dependency === "string") {
                        pushId(dependency);
                    } else {
                        Object.keys(dependency)
                            .map(function (label) { return dependency[label]; })
                            .forEach(pushId);
                    }
                });

                return ids;
            },
            getIdFromIdentifier: function (identifier, baseModuleId) {
                var moduleDir = getDirectoryPortion(baseModuleId);

                var labelsToIds = makeLabelsToIdsMap(moduleDir, getDependenciesFor(baseModuleId));
                return labelsToIds.containsKey(identifier) ? labelsToIds.get(identifier)
                                                           : getIdFromStringIdentifier(moduleDir, identifier);
            }
        };
    }());

    var scriptLoader = (function () {
        var loadingUriSet = createSet();
        var loadedUriSet = createSet();
        var loadListeners = createListenerCollection();

        // An array of DOM elements for the <script /> tags we insert, so that when we reset the module loader, 
        // we can remove them.
        var scriptTagEls = [];

        return {
            reset: function () {
                loadingUriSet.empty();
                loadedUriSet.empty();
                loadListeners.empty();

                // Remove any <script /> elements we inserted in a previous life.
                scriptTagEls.forEach(function (el) {
                    document.head.removeChild(el);
                });
                scriptTagEls.length = 0;
            },
            load: function (uri, onComplete) {
                if (loadedUriSet.contains(uri)) {
                    onComplete();
                    return;
                }

                loadListeners.add(uri, onComplete);
                if (loadingUriSet.contains(uri)) {
                    return;
                }
                loadingUriSet.add(uri);

                var el = document.createElement("script");

                function onLoadedOrErrored() {
                    el.removeEventListener("load", onLoadedOrErrored, false);
                    el.removeEventListener("error", onLoadedOrErrored, false);

                    loadingUriSet.remove(uri);

                    loadListeners.trigger(uri);

                    loadedUriSet.add(uri);
                }
                el.addEventListener("load", onLoadedOrErrored, false);
                el.addEventListener("error", onLoadedOrErrored, false);
                    
                // If specified, we want to prevent caching, so append a timestamp to the URI. Separate it with 
                // underscores so that when debugging you can visually separate the filename (which you care about) 
                // from the timestamp (which you don't care about).
                el.src = debugOptions.disableCaching ? uri + "?___________________________________" + Date.now() : uri;

                document.head.appendChild(el);
                scriptTagEls.push(el);
            }
        };
    }());
    //#endregion

    //#region require namespace implementation
    function isMemoizedImpl(id) {
        return pendingDeclarations.containsKey(id) || exportsMemo.containsKey(id);
    }

    function memoizeImpl(id, dependencies, moduleFactory) {
        pendingDeclarations.set(id, { moduleFactory: moduleFactory, dependencies: dependencies });

        // Update our dependency array so that calls to the corresponding require know about any new labels this 
        // memoize call introduced.
        dependencyTracker.setDependenciesFor(id, dependencies);

        // Create and store the module object for this module so that future code can use it to e.g. provide modules 
        // with this module as the base.
        moduleObjectMemo.set(id, moduleObjectFactory.create(id, dependencies));
    }

    function initializeModule(id) {
        // If we already set an exports object in pendingDeclarations, then we are in a circular dependency situation.
        // Example: in initializeModule("a"), we do pendingDeclarations.get("a").exports = {}, then call 
        // moduleFactoryA, which called require("b"), which called initializeModule("b"), which executed 
        // moduleFactoryB, which called require("a"), which called initializeModule("a") again, which is where we're 
        // at now.
        if (pendingDeclarations.get(id).exports) {
            // In that case, just use the previously-set exports; we might be only partially initialized, but that's 
            // the price you pay for having circular dependencies. And, the caller still gets a reference to the 
            // exports, which will be updated when we finish initializing the modules in the circle.
            exportsMemo.set(id, pendingDeclarations.get(id).exports);
            return;
        }

        var moduleFactory = pendingDeclarations.get(id).moduleFactory;
        var dependencies = pendingDeclarations.get(id).dependencies;

        // Create a context-aware require to pass in to moduleFactory.
        var require = requireFactory(id, dependencies);

        // Get or create a module object to pass in to moduleFactory. If the default implementation of module.provide 
        // is used, or the overriden implementation uses require.memoize, moduleObjectMemo will have it; otherwise, 
        // we'll need to create a new copy.
        var module = null;
        if (id === EXTRA_MODULE_ENVIRONMENT_MODULE_ID) {
            module = globalModule;
        } else if (moduleObjectMemo.containsKey(id)) {
            module = moduleObjectMemo.get(id);
        } else {
            moduleObjectMemo.set(id, moduleObjectFactory.create(id, dependencies));
            module = moduleObjectMemo.get(id);
        }

        // Create an empty exports to pass in to moduleFactory, and keep it in pendingDeclarations under id for 
        // circular reference tracking as explained above.
        var exports = pendingDeclarations.get(id).exports = {};

        var factoryResult = moduleFactory(require, exports, module);

        // If the moduleFactory initiated a circular require chain (see above), its exports will get stored in 
        // exportsMemo under id. But if those exports are alternate exports, we won't be able to guarantee that we 
        // hand out the same exports reference to everyone, so we need to throw an error.
        if (exportsMemo.containsKey(id) && exportsMemo.get(id) !== exports) {
            throw new Error('Module "' + id + '" contains circular dependencies that return alternate exports '
                          + 'instead of using the exports object.');
        }

        // If the module does not return anything, use our exports object; if it does, its exported API is the
        // factory's returned result.
        exportsMemo.set(id, factoryResult === undefined ? exports : factoryResult);

        // Now that the exportsMemo has an entry for this ID, remove the pendingDeclarations entry.
        pendingDeclarations.remove(id);
    }

    function requireFactory(originatingId, dependencies) {
        var require = function (moduleIdentifier) {
            if (typeof moduleIdentifier !== "string") {
                throw new TypeError("moduleIdentifier must be a string.");
            }

            var id = dependencyTracker.getIdFromIdentifier(moduleIdentifier, originatingId);

            if (!exportsMemo.containsKey(id) && pendingDeclarations.containsKey(id)) {
                initializeModule(id);
            }

            if (!exportsMemo.containsKey(id)) {
                throw new Error('Module "' + id + '" has not been provided and is not available.');
            }

            if (debugOptions.warnAboutUndeclaredDependencies && originatingId !== EXTRA_MODULE_ENVIRONMENT_MODULE_ID) {
                var dependencyIdsForDebugWarning = dependencyTracker.getDependencyIdsFor(originatingId);

                if (dependencyIdsForDebugWarning.indexOf(id) === -1) {
                    warn('The module with ID "' + id + '" was not specified in the dependency array for the "'
                       + originatingId + '" module.');
                }
            }

            return exportsMemo.get(id);
        };

        require.id = function (moduleIdentifier) {
            if (typeof moduleIdentifier !== "string") {
                throw new TypeError("moduleIdentifier must be a string");
            }

            return dependencyTracker.getIdFromIdentifier(moduleIdentifier, originatingId);
        };

        require.uri = function (moduleIdentifier) {
            if (typeof moduleIdentifier !== "string") {
                throw new TypeError("moduleIdentifier must be a string");
            }

            return getUriFromId(dependencyTracker.getIdFromIdentifier(moduleIdentifier, originatingId));
        };

        require.memoize = function (id, dependencies, moduleFactory) {
            if (typeof id !== "string") {
                throw new TypeError("id must be a string.");
            }
            if (!Array.isArray(dependencies)) {
                throw new TypeError("dependencies must be an array.");
            }
            if (typeof moduleFactory !== "function") {
                throw new TypeError("moduleFactory must be a function for " + id + ".");
            }
            if (!dependencyTracker.isValidArray(dependencies)) {
                throw new TypeError("dependencies must be an array of strings or labeled dependency objects.");
            }

            if (isMemoizedImpl(id)) {
                throw new Error(id + " is already provided.");
            }

            memoizeImpl(id, dependencies, moduleFactory);
        };

        require.isMemoized = function (id) {
            if (typeof id !== "string") {
                throw new TypeError("id must be a string.");
            }

            return isMemoizedImpl(id);
        };

        require.displayName = originatingId === EXTRA_MODULE_ENVIRONMENT_MODULE_ID ? "require <EME>"
                            : originatingId === MAIN_MODULE_ID ? "require <main>"
                            : 'require <"' + originatingId + '">';
        require.id.displayName = "require.id";
        require.uri.displayName = "require.uri";
        require.memoize.displayName = "require.memoize";
        require.isMemoized.displayName = "require.isMemoized";


        return Object.freeze(require);
    }
    //#endregion

    //#region Module namespace implementation
    var moduleObjectFactory = (function () {
        // This class is accessible via module.constructor for module provider plug-ins to override,
        // but by default its methods forward to the implementations below.
        function NobleModule(id, dependencies) {
            // Not writable or configurable, just enumerable.
            Object.defineProperties(this, {
                id: {
                    value: id,
                    enumerable: true
                },
                dependencies: {
                    get: function () { return dependencyTracker.getDependenciesCopyFor(id); },
                    enumerable: true
                }
            });
        }

        //#region Default implementations for overridable functions

        // An object containing { moduleFactory, dependencies } for the brief period between module.declare being 
        // called (in a module's file), and the callback for its <script /> tag's load event firing. Our listener (in 
        // provideImpl below) picks up values from here.
        var scriptTagDeclareStorage = null;

        //#region Module provision implementation helpers
        var providingIdSet = createSet();
        var providedIdSet = createSet();
        var provideListeners = createListenerCollection();

        var provisionWaitingTracker = (function () {
            var waitingForToWaiters = createMap();

            return {
                recordAsWaitingOn: function (beingProvided, waiter) {
                    if (beingProvided === waiter) {
                        // Bail out when the below recursion ends up degenerately recording A depends on A.
                        return;
                    }

                    // Add an entry saying waiter depends on beingProvided.
                    if (!waitingForToWaiters.containsKey(beingProvided)) {
                        waitingForToWaiters.set(beingProvided, createSet());
                    }
                    waitingForToWaiters.get(beingProvided).add(waiter);

                    // If other modules are waiting on waiter, we need to note that they are now also waiting on 
                    // beingProvided.
                    if (waitingForToWaiters.containsKey(waiter)) {
                        waitingForToWaiters.get(waiter).values().forEach(function (waitingOnWaiter) {
                            if (!waitingForToWaiters.containsKey(beingProvided) ||
                                !waitingForToWaiters.get(beingProvided).contains(waitingOnWaiter)) {
                                provisionWaitingTracker.recordAsWaitingOn(beingProvided, waitingOnWaiter);
                            }
                        });
                    }

                    // And if beingProvided is being waited on by other modules, we need to note that waiter
                    // is also waiting on those modules in addition to just beingProvided itself.
                    waitingForToWaiters.keys().forEach(function (key) {
                        if (waitingForToWaiters.get(key).contains(beingProvided) &&
                            !waitingForToWaiters.get(key).contains(waiter)) {
                            provisionWaitingTracker.recordAsWaitingOn(key, waiter);
                        }
                    });
                },
                isWaitingOn: function (beingProvided, waiter) {
                    return waitingForToWaiters.containsKey(beingProvided) &&
                           waitingForToWaiters.get(beingProvided).contains(waiter);
                },
                onProvided: function (isNowProvided) {
                    waitingForToWaiters.remove(isNowProvided);
                },
                reset: waitingForToWaiters.empty
            };
        }());

        function provideUnprovidedDependencies(id, onProvided) {
            // This function is called when providing a module that has already been memoized.
            // Even though it's been memoized, its dependencies could have been not provided, but now
            // someone is asking to provide this module, so we need to provide its dependencies first.

            // Figure out what is currently in the process of being provided that we need to wait on, and what we need 
            // to provide ourselves. In the former case, don't wait on dependencies in a circular dependency chain: 
            // for them, the provision that a module is not provided until all its dependencies are provided cannot be 
            // fulfilled.
            var dependencyIds = dependencyTracker.getDependencyIdsFor(id);
            var beingProvided = dependencyIds.filter(function (dependencyId) {
                return providingIdSet.contains(dependencyId) && !provisionWaitingTracker.isWaitingOn(id, dependencyId);
            });
            var needToProvide = dependencyIds.filter(function (dependencyId) {
                return !providingIdSet.contains(dependencyId) && !providedIdSet.contains(dependencyId);
            });

            var provideCallback = createCallbackAggregator(beingProvided.length + 1, onProvided);
            beingProvided.forEach(function (dependencyBeingProvided) {
                provisionWaitingTracker.recordAsWaitingOn(dependencyBeingProvided, id);
                provideListeners.add(dependencyBeingProvided, provideCallback);
            });
            moduleObjectMemo.get(id).provide(needToProvide, provideCallback);
        }

        function memoizeAndProvideDependencies(id, dependencies, moduleFactory, onMemoizedAndProvided) {
            // This function is called when a module is introduced via module.declare (including the main module).

            memoizeImpl(id, dependencies, moduleFactory);
            provideUnprovidedDependencies(id, onMemoizedAndProvided);
        }
        //#endregion

        //#region Module declaration implementation helpers
        function initializeMainModule(dependencies, moduleFactory) {
            moduleObjectFactory.setMainModuleExports({});
            memoizeAndProvideDependencies(MAIN_MODULE_ID, dependencies, moduleFactory, function onMainModuleReady() {
                // Calling require will do the actual initialization.
                moduleObjectFactory.setMainModuleExports(globalRequire(MAIN_MODULE_ID));
            });
        }

        // RegExp and function based on BravoJS, which says "mostly borrowed from FlyScript."
        // NB: requireRegExp has two capturing clauses: one for double quotes, and one for single.
        // It does not capture the quotes (unlike BravoJS/FlyScript).
        var requireRegExp = /\/\/.*|\/\*[\s\S]*?\*\/|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|[;=(,:!^]\s*\/(?:\\.|[^\/\\])+\/|(?:^|\W)\s*require\s*\(\s*(?:"((?:\\[\s\S]|[^"\\])*)"|'((?:\\[\s\S]|[^'\\])*)')\s*\)/g;

        function scrapeDependenciesFrom(rawSource) {
            var dependencies = createSet();

            var result = null;
            while ((result = requireRegExp.exec(rawSource)) !== null) {
                var moduleIdentifier = result[1] || result[2];
                if (moduleIdentifier) {
                    dependencies.add(moduleIdentifier);
                }
            }

            return dependencies.values();
        }
        //#endregion

        function declareImpl(dependencies, moduleFactory) {
            if (moduleFactory === undefined) {
                moduleFactory = dependencies;
                dependencies = scrapeDependenciesFrom(moduleFactory.toString());
            }

            if (!globalModule.main) {
                // The first time declare is called, there is no main module, so make this one the main module.
                initializeMainModule(dependencies, moduleFactory);
            } else {
                // Otherwise we're inside a <script />-inserted module, so put things in scriptTagDeclareStorage for 
                // module.load to play with.
                scriptTagDeclareStorage = { moduleFactory: moduleFactory, dependencies: dependencies };
            }
        }

        function eventuallyImpl(functionToCallEventually) {
            // "This function exists to bridge the gap between CommonJS environments that are built on event loops,
            //  and those that are not, for the purposes of writing module provider plug-ins."
            // We are event-loop based, so we don't need to do anything special.
            functionToCallEventually();
        }

        function loadImpl(moduleIdentifier, onModuleLoaded) {
            var id = dependencyTracker.getIdFromIdentifier(moduleIdentifier, this.id);
            var uri = getUriFromId(id);

            scriptLoader.load(
                uri,
                onModuleLoaded
            );
        }

        function provideImpl(dependencies, onAllProvided) {
            if (dependencies.length === 0) {
                onAllProvided();
                return;
            }

            var id = this.id;
            var load = this.load;
            var dependencyIds = dependencyTracker.transformToIdArray(dependencies, id);
            var onDependencyProvided = createCallbackAggregator(dependencyIds.length, onAllProvided);

            // Do a first pass to fill in the providingIdSet, so that it's up-to-date in any recursive provide calls 
            // we make in the following loop.
            dependencyIds.forEach(providingIdSet.add);

            // Similarly, let the provisionWaitingTracker know that id will be waiting on each of these dependencies.
            dependencyIds.forEach(function (dependencyId) {
                provisionWaitingTracker.recordAsWaitingOn(dependencyId, id);
            });

            // Provide each dependency, loading it first if necessary.
            dependencyIds.forEach(function (id) {
                function onThisDependencyProvided() {
                    providingIdSet.remove(id);
                    providedIdSet.add(id);
                    provisionWaitingTracker.onProvided(id);
                    provideListeners.trigger(id);
                    onDependencyProvided();
                }

                function onModuleFileLoaded() {
                    if (isMemoizedImpl(id)) {
                        // This case occurs if the system is told to provide a module twice in a row. The first call 
                        // starts the loading process, and when finished, ends up in the next branch, calling 
                        // memoizeAndProvideDependencies. The second call waits for the loading process to complete, 
                        // and when it does, ends up in this branch, since the first call already memoized the module.
                        provideUnprovidedDependencies(id, onThisDependencyProvided);
                    } else if (scriptTagDeclareStorage) {
                        // Grab the dependencies and factory from scriptTagDeclareStorage; they were kindly left there 
                        // for us by module.declare.
                        var dependencies = scriptTagDeclareStorage.dependencies;
                        var moduleFactory = scriptTagDeclareStorage.moduleFactory;
                        scriptTagDeclareStorage = null;

                        memoizeAndProvideDependencies(id, dependencies, moduleFactory, onThisDependencyProvided);
                    } else {
                        // Since this code executes immediately after the file loads, we know that if the module 
                        // wasn't memoized but scriptTagDeclareStorage is also null, then either:
                        // (a) The file didn't exist or failed to load, resulting in the callback being called without 
                        //     the module successfully loading.
                        // (b) module.declare must never have been called in the file, and thus never filled 
                        //     scriptTagDeclareStorage for us; or
                        // (c) other module-related things happened after module.declare inside the file.
                        // In case (a), we need to let the user know. In cases (b) and (c): BAD module author! BAD!
                        warn('Tried to load module with ID "' + id
                           + '", but it did not correspond to a valid module file.');

                        onThisDependencyProvided();
                    }
                }

                if (isMemoizedImpl(id)) {
                    // This is necessary for the case of modules introduced into the system via require.memoize, 
                    // instead of module.declare. For more discussion see 
                    // http://groups.google.com/group/commonjs/browse_thread/thread/53057f785c6f5ceb

                    // Note that we don't just unconditionally do load(id, onModuleFileLoaded) and count on reaching 
                    // the first branch in onModuleFileLoaded (which does essentially the same thing), because we want 
                    // to avoid calling into a possibly-third-party module.load.

                    provideUnprovidedDependencies(id, onThisDependencyProvided);
                } else {
                    load(id, onModuleFileLoaded);
                }
            });
        }
        //#endregion

        // These argument-validation decorators are applied to NobleModule instances in moduleObjectFactory.create().
        var argumentValidationFunctions = {
            declare: function (dependencies, moduleFactory) {
                if (moduleFactory === undefined) {
                    moduleFactory = dependencies;
                    dependencies = [];
                } else if (!Array.isArray(dependencies)) {
                    throw new TypeError("dependencies must be an array");
                }
                if (typeof moduleFactory !== "function") {
                    throw new TypeError("moduleFactory must be a function");
                }
                if (!dependencyTracker.isValidArray(dependencies)) {
                    throw new TypeError("dependencies must be an array of strings or labeled dependency objects.");
                }
            },
            eventually: function (functionToCallEventually) {
                if (typeof functionToCallEventually !== "function") {
                    throw new TypeError("functionToCallEventually must be a function.");
                }
            },
            load: function (moduleIdentifier, onModuleLoaded) {
                if (typeof moduleIdentifier !== "string") {
                    throw new TypeError("moduleIdentifier must be a string.");
                }
                if (typeof onModuleLoaded !== "function") {
                    throw new TypeError("onModuleLoaded must be a function.");
                }
            },
            provide: function (dependencies, onAllProvided) {
                if (!Array.isArray(dependencies)) {
                    throw new TypeError("dependencies must be an array.");
                }
                if (typeof onAllProvided !== "function") {
                    throw new TypeError("onAllProvided must be a function.");
                }
                if (!dependencyTracker.isValidArray(dependencies)) {
                    throw new TypeError("dependencies must be an array of strings or labeled dependency objects.");
                }
            }
        };

        return {
            create: function (id, dependencies) {
                // Used to apply argument-validation decorators to NobleModule instances before passing the resulting 
                // objects to module factory functions. This allows module provider plug-ins to hook in by overriding
                // module.constructor.prototype, but still benefit from argument validation without having to do it 
                // themselves. Also binds these methods to the module object, so you can do var load = module.load and 
                // use it without "this"-related problems.

                var moduleObject = new NobleModule(id, dependencies);

                Object.keys(argumentValidationFunctions).forEach(function (methodName) {
                    moduleObject[methodName] = function () {
                        argumentValidationFunctions[methodName].apply(moduleObject, arguments);
                        NobleModule.prototype[methodName].apply(moduleObject, arguments);
                    };
                    moduleObject[methodName].displayName = "module." + methodName;
                });

                return moduleObject;
            },
            setMainModuleExports: function (exports) {
                NobleModule.prototype.main = exports;
            },
            reset: function () {
                providingIdSet.empty();
                providedIdSet.empty();
                provideListeners.empty();
                provisionWaitingTracker.reset();
                scriptTagDeclareStorage = null;

                // Reset the main module; now, the next call to module.declare will declare a new main module.
                moduleObjectFactory.setMainModuleExports(null);
            },
            resetOverridableMethods: function () {
                NobleModule.prototype.declare = declareImpl;
                NobleModule.prototype.eventually = eventuallyImpl;
                NobleModule.prototype.load = loadImpl;
                NobleModule.prototype.provide = provideImpl;
            }
        };
    }());
    //#endregion

    // A special debugging module with access to our internal state.
    var debugModule = Object.freeze({
        setDebugOptions: function (options) {
            if (typeof options !== "object" || options === null) {
                options = {};
            }

            debugOptions = debugOptions || {};
            Object.keys(DEFAULT_DEBUG_OPTIONS).forEach(function (optionName) {
                if (options.hasOwnProperty(optionName)) {
                    debugOptions[optionName] = typeof options[optionName] === typeof DEFAULT_DEBUG_OPTIONS[optionName]
                                                   ? options[optionName]
                                                   : DEFAULT_DEBUG_OPTIONS[optionName];
                }
            });
        },
        reset: reset,
        listModules: function () {
            return exportsMemo.keys().concat(pendingDeclarations.keys());
        }
    });

    function reset(options) {
        if (typeof options !== "object" || options === null) {
            options = {
                mainModuleDirectory: DEFAULT_MAIN_MODULE_DIR,
                withDebugOptions: DEFAULT_DEBUG_OPTIONS,
                keepPluginOverrides: false
            };
        }

        mainModuleDir = typeof options.mainModuleDirectory === "string"
                            ? options.mainModuleDirectory
                            : DEFAULT_MAIN_MODULE_DIR;

        debugModule.setDebugOptions(options.withDebugOptions);

        // Reset shared state.
        moduleObjectMemo.empty();
        exportsMemo.empty();
        pendingDeclarations.empty();

        moduleObjectFactory.reset();
        scriptLoader.reset();
        dependencyTracker.reset();
        
        // If desired, reset any methods that might have been overriden by module provider plug-ins.
        if (!options.keepPluginOverrides) {
            moduleObjectFactory.resetOverridableMethods();
        }

        // Reset the global require and module variables that we return from the global.require/global.module getters.
        globalRequire = requireFactory(EXTRA_MODULE_ENVIRONMENT_MODULE_ID,
                                       EXTRA_MODULE_ENVIRONMENT_MODULE_DEPENDENCIES);
        globalModule = moduleObjectFactory.create(EXTRA_MODULE_ENVIRONMENT_MODULE_ID,
                                                  EXTRA_MODULE_ENVIRONMENT_MODULE_DEPENDENCIES);

        // Provide the debug module.
        globalRequire.memoize("nobleModules", [], function () { return debugModule; });
    }

    function initialize() {
        // Reset is where most of the initialization takes place; it's shared code.
        reset();

        // We use the strategy of accessor descriptors for closure variables that we control, instead of the
        // perhaps-more-obvious approach of using data descriptors, since we need to be able to reset when asked.
        // Since the global require and module should not be configurable, getters are the only way to allow us to
        // change their values in reset(), since a non-configurable data descriptor cannot be re-defined.

        // Note that we explicitly specify false for configurable, to account for the case where e.g. a previous
        // script did global.module = {}. Then the below code would be a *re*definition of global.module, and if we 
        // didn't specify, we would inherit the implied configurable: true from the previous script's definition of 
        // global.module.
        Object.defineProperties(global, {
            require: {
                get: function () { return globalRequire; },
                enumerable: true,
                configurable: false
            },
            module: {
                get: function () { return globalModule; },
                enumerable: true,
                configurable: false
            }
        });
    }

    initialize();
}(this));
