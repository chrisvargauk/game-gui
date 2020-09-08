(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["GameGUI"] = factory();
	else
		root["GameGUI"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/Component.js":
/*!**************************!*\
  !*** ./src/Component.js ***!
  \**************************/
/*! exports provided: Component */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Component", function() { return Component; });
class Component {
  constructor ( option = {}, config = {}, dataFromParent = {} ) {
    // Note: "option" and "config" are registered at first include when Comp is instantiated.
    //       These props wont be updated even if then change at subsequent re-renderings.
    this.option                     = option;
    this.config                     = config;

    this.id                         = typeof config.id !== 'undefined' ? config.id : this.uid();
    this.type                       = this.getTypeOfComp( this );
    this.classNameInHtml            = this.camelCaseToSnakeCase( this.type );
    this.dom                        = this.createDomRepresentation();
    // Note: "this.dom" this is a wrapper element. The output of "this.render(..)"
    // is placed inside this wrapper. The wrapper is created only once at
    // Comp instantiation, but its content is created from scratch, then injected at
    // every Comp Render call - at this.render(..).
    this.listObjCompChildByType     = {}; // Cache previously rendered Comps here.
    this.html                       = '';
    this.ctrChildByType             = {};

    this.state                      = {};
    this.isStateUpdated             = false; // when Comp State is updated, this is set to true till
                                             // State Change is rendered to HTML/DOM
    this.dataFromParentAsStringPrev = undefined;

    // Run Life Cycle Method if defined on Comp Instance
    if  (typeof this.afterInstantiation !== 'undefined') {
      this.afterInstantiation( dataFromParent );
    }
  }

  getTypeOfComp ( comp ) {
    // Issue: Babel transpiles MyCompName to MyCompName_ImportedCompName. We are filtering this off here.
    //        If we ignored this, the code wouldn't be compilable.
    const type = Object.getPrototypeOf(comp).constructor.name;
    const listTypePart = type.split('_');
    return listTypePart[ listTypePart.length -1 ];
  }

  createDomRepresentation () {
    const domElement = document.createElement('div');
    domElement.classList.add( this.classNameInHtml );
    domElement.setAttribute('id', this.id);

    return domElement;
  }

  render() {
    return `<span>Placeholder text for Comp ${this.type}</span>`;
  }

  /**
   * Syntax: ..${this.include(ClassComp, dataFromParent, config)}
   * Use "include" inside any "render" method to embed Comps inside Comps.
   * It returns a Placeholder HTML Snippet, that is included in the Parent Comps DOM till
   * the next Game GUI Render Event will call "renderToHtmlAndDomify" on Parent Comp,
   * when all Placeholder HTML Snippet will be replaced with the relevant Included Comps DOM.
   * @param ClassComp
   * @param dataFromParent
   * @param config
   * @returns {string|*}
   */
  include ( ClassComp, dataFromParent, config ) {
    // If Smart Comp (Class)
    if ( ClassComp.prototype instanceof Component ) {
      const typeComp = ClassComp.name;
      const ctrChild = this.ctrChildByType[ typeComp ] = typeof this.ctrChildByType[ typeComp ] === 'undefined' ?
        0                                                   :
        ++this.ctrChildByType[ typeComp ];

      const idCompChild = (config && typeof config.id !== 'undefined') ? config.id : ctrChild;
      this.listObjCompChildByType[ typeComp ] = this.listObjCompChildByType[ typeComp ] || {};
      let compChild = this.listObjCompChildByType[ typeComp ][ idCompChild ];

      // Create new instance of Comp only if it hasn't been created yet
      if ( typeof compChild === 'undefined' ) {
        compChild = this.listObjCompChildByType[ typeComp ][ idCompChild ] = new ClassComp( this.option, config, dataFromParent );
        // Note: "option" is a global in the scope of Game GUI, therefore we pass it along to every Child Comp,
        //       hence making it available in every Comp through "this.option".
        //       "config" and "dataFromParent" on the other hand are specific to each Comp,
        //       therefore we pass in a new one at every include, unlike we do with "option".
        //       "option" and "config" both are registered when the Comp is instantiated (at first inclusion),
        //       then we never update them again, even if we include them multiple times with different config,
        //       that won't effect the original config. Therefore, you are welcome to modify it (e.g. in constructor)
        //       after Comp is instantiated, those modifications will remain.
        //       "dataFromParent" on the other hand will be update and passed in to "render" method,
        //       every time the Parent Comp is re-rendered.

        // Hook up Game GUI Methods: scheduler, indexComp
        // Note: make sure you dont bind this, you need scheduler to resolve to ui framework,
        //       and not to Comp instance.
        //       These hooked up methods wont be used/called at construction time,
        //       therefore there is no problem hooking them up after Comp Instantiation.
        compChild.scheduleRendering = this.scheduleRendering;
        compChild.indexComp         = this.indexComp;
        compChild.listBindExternal  = this.listBindExternal;

        // Index Comp (by "type" and "id") for quick access, right after its created and even before its rendered.
        // Note: The rendering of Root Comp will trigger the indexing of all Sub Comps.
        this.indexComp( compChild );
      }

      compChild.renderToHtmlAndDomify( dataFromParent );
      // Note: "dataFromParent" from Parent Comp is updated in Child Comp by "include", but
      //       "config" and "option" are not, they are passed in only at first inclusion (at Comp Instantiation)

      const idFromConfig = (config && typeof config.id !== 'undefined') ? config.id : '';

      return `<div class="comp-placeholder" type="${typeComp}" id-from-config="${idFromConfig}" ctr-child="${ctrChild}">placeholder text</div>`;

      // If Dumb Comp (Function)
    } else {
      return ClassComp( dataFromParent, this.option );
    }
  };

  renderToHtmlAndDomify ( dataFromParent ) {
    // Optimise Rendering to HTML
    // Note: Comp HTML Representation can change one of three ways:
    //       A) Data Passed in from Parent Comp has changed
    //       B) State has changed
    //       C) HTML Representation of Comp has never been created before, therefore
    //          what ever we render will be different from current HTML Representation of the Comp.

    const renderBecauseDataPassedInChanged = this.isRenderBecauseDataPassedInChanged ( dataFromParent );

    // Don't skip if HTML representation of Comp has never been rendered yet.
    // Skip only if Data Passed In From Parent Comp hasn't changed and the sate of the Comp hasn't changed either
    if (this.html !== '' &&
      !renderBecauseDataPassedInChanged &&
      !this.isStateUpdated
    ) {
      return false;
    }

    // Note: Record of Data Passed In From Parent has already been updated by "isRenderBecauseDataPassedInChanged"
    //       because we have already stringified Data Passed In From Parent in "isRenderBecauseDataPassedInChanged",
    //       therefore we don't want to do it twice, efficiency
    // !! this.dataFromParentAsStringPrev = JSON.stringify( dataFromParent );

    // Render to HTML String
    this.ctrChildByType = {};
    var htmlNewRender   = this.render( dataFromParent );
    this.isStateUpdated = false; // Updated Comp State is rendered to HTML/DOM at "this.render(..)", so we reset it here

    // Skip ReDomify if Comp Shallow Render looks the same
    // Note: if the Data Passed In From Parent has changed and/or Comp State has changed,
    //       that doesn't necessarily mean that the rendered HTML is different
    if ( htmlNewRender === this.html ) {
      return false;
    }

    this.html = htmlNewRender;

    // DOMify HTML String
    this.dom.innerHTML = this.html;

    // Bind Built in Event Handlers automatically right after DOM is ready
    this.doBindExternal();

    // Run Life Cycle Method if defined on Comp Instance
    if  (typeof this.afterRender !== 'undefined') {
      this.afterRender();
    }

    // Inject Child Comps if any
    this.replaceCompPlaceholderAll( this.dom );

    return true;
  }

  isRenderBecauseDataPassedInChanged ( dataFromParent ) {
    const isUndefinedDataFromParentAsStringPrev = typeof this.dataFromParentAsStringPrev === 'undefined';
    const isUndefinedDataFromParentAsString     = typeof dataFromParent                  === 'undefined';

    // Scenario 1)  prev === undefined && passed === undefined --> DON'T RENDER
    if ( isUndefinedDataFromParentAsStringPrev &&
      isUndefinedDataFromParentAsString
    ) {
      return false;
    }

    const dataFromParentAsString = JSON.stringify( dataFromParent );

    // Scenario 2)  prev === undefined && passed !== undefined --> RENDER
    if ( isUndefinedDataFromParentAsStringPrev &&
      !isUndefinedDataFromParentAsString
    ) {
      this.dataFromParentAsStringPrev = dataFromParentAsString;
      return true;
    }

    // Scenario 3)  prev !== undefined && passed === undefined --> RENDER
    if ( !isUndefinedDataFromParentAsStringPrev &&
      isUndefinedDataFromParentAsString
    ) {
      this.dataFromParentAsStringPrev = dataFromParentAsString;
      return true;
    }

    // Scenario 4)  prev !== undefined && passed !== undefined --> COMPARE
    if ( !isUndefinedDataFromParentAsStringPrev &&
      !isUndefinedDataFromParentAsString
    ) {
      // Compare / same       --> DON'T RENDER
      if ( this.dataFromParentAsStringPrev === dataFromParentAsString) {
        return false;

        // Compare / different  --> RENDER
      } else {
        this.dataFromParentAsStringPrev = dataFromParentAsString;
        return true;
      }
    }

    console.error('Something unexpected happened o_0?');
  debugger;
  }

  doBindExternal() {
    // ui-MY-NAME-COMES-HERE | Do link bindings automatically right after rendering
    // Note: Binding happens before Child Comps are injected so Encapsulation is unharmed
    if (this.listBindExternal && 0 < this.listBindExternal.length) {
      for (let indexListBindExternal = 0; indexListBindExternal < this.listBindExternal.length; indexListBindExternal++) {
        const bindExternal = this.listBindExternal[ indexListBindExternal ];

        const listNodeBtnUiClick = this.dom.querySelectorAll('['+bindExternal.nameAttribute+']');
        for (let indexListNodeBtnUiClick = 0; indexListNodeBtnUiClick < listNodeBtnUiClick.length; indexListNodeBtnUiClick++) {
          const domNode = listNodeBtnUiClick[ indexListNodeBtnUiClick ];

          const valueAttrib = domNode.getAttribute(bindExternal.nameAttribute);
          domNode.addEventListener(bindExternal.typeEvent, (evt) => {
            bindExternal.callback.call(this, valueAttrib, domNode, evt);
          }, false);
        }
      }
    }
  }

  replaceCompPlaceholderAll () {
    // Get a list of all Placeholder Child Component
    var nodeListPlaceholder = this.dom.querySelectorAll('.comp-placeholder');

    // Iterate over all Placeholder Child Comps and replace them with Comp DOM
    for (let indexNodeListPlaceholder = 0; indexNodeListPlaceholder < nodeListPlaceholder.length; indexNodeListPlaceholder++) {
      let dPlaceholder = nodeListPlaceholder[ indexNodeListPlaceholder ];

      const typeComp          = dPlaceholder.getAttribute('type');
      const idCompFromConfig  = dPlaceholder.getAttribute('id-from-config');
      const ctrChild          = dPlaceholder.getAttribute('ctr-child');

      const idCompChild = !!idCompFromConfig ? idCompFromConfig : ctrChild;
      const compChild   = this.listObjCompChildByType[ typeComp ][ idCompChild ];

      if (!compChild) {
        const message  = `Warning: Component can't be found: typeComp==="${typeComp}", idCompFromConfig==="${idCompFromConfig}", ctrChild==="${ctrChild}". State of Cached Comps: `;
        console.warn(message, JSON.stringify(this.listObjCompChildByType));
        continue;
      }

      compChild.dom = dPlaceholder.insertAdjacentElement('beforebegin', compChild.dom);
      dPlaceholder.parentNode.removeChild(dPlaceholder);
    }
  };

  getState () {
    return this.state;
  };

  setState ( stateNew ) {
    this.state = stateNew;
    this.isStateUpdated = true;

    if ( typeof this.scheduleRendering !== 'undefined' ) {
      this.scheduleRendering( this );
    }
  };


  // # Utility
  // # #######

  camelCaseToSnakeCase (str) {
    return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase()
  }

  uid () {
    return Date.now()+''+Math.round(Math.random() * 100000);
  }
}

/***/ }),

/***/ "./src/GameGUI.js":
/*!************************!*\
  !*** ./src/GameGUI.js ***!
  \************************/
/*! exports provided: GameGUI */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GameGUI", function() { return GameGUI; });
class GameGUI {
  constructor(RootComp, selectorGuiRoot, option, configRootComp) {
    // Reg Root Comp automatically if requirements are fulfilled
    // Note: don't run it by default, you may want to control the steps.
    if (typeof RootComp === 'undefined' ||
      typeof selectorGuiRoot === 'undefined'
    ) {
      return;
    }

    this.init(option);
    this.regRootComp(RootComp, selectorGuiRoot, configRootComp);

    // Register Global 'gui-click' Built in Event Handler
    this.registerBindingBuiltIn();

    // Call the very first render ASAP
    // Note:  Otherwise you might see a brief flash
    //        Running render in the constructor means, all includes will be called recursively,
    //        therefore all Comp / SubC omp Instantiation will happen sequentially when Game GUI is Instantiated.
    //        That said, all Comps are indexed and ready to be accessed right after Game GUI Instantiation.
    setTimeout(this.render.bind(this), 0);
  };

  init(option = {}) {
    this.optionDefault = {
      fps: 60,
    };

    // Should compose option from default options, and options passed in at construction
    this.option = {
      ...this.optionDefault,
      ...option,
    };

    this.isRenderingDue = false;
    this.listObjIdRenderingScheduled = {};

    // Indexed list of all rendered Comps
    this.listObjTypeComp  = {};
    this.listObjIdComp    = {};

    // Store and call from the list of callbacks passed in to be run right after rendering(s) is complete.
    this.listBindExternal = [];
    this.listObjTypeListEventListener = {};
    this.isDOMContentReady = false;

    // Note: Don't worry about calling render 60 times a sec,
    // render method start with "if(!this.isRenderingDue ) return;"
    this.tokenUiRender;
    if (typeof interval !== 'undefined') {
      this.tokenUiRender = interval.setInterval(this.render.bind(this), Math.floor(1000/this.option.fps));
    } else {
      this.tokenUiRender = setInterval(this.render.bind(this), Math.floor(1000/this.option.fps));
    }
  }

  regRootComp ( RootComp, selectorGuiRoot, configRootComp ) {
    // Get UI Root
    this.domRoot = document.querySelector( selectorGuiRoot );

    // Throws if Root DOM Element doesn't exist
    if (this.domRoot === null) {
      throw('ERROR: DOM Root can\'t be found by using the provided selector: ' + selectorGuiRoot);
    }

    // Instantiate Root Comp
    this.rootComp = new RootComp( this.option, configRootComp );

    // Hook up Game GUI Methods: scheduler, indexComp, ..
    // Note: we dont want to pass in scheduler into comps, we want to keep comp constructor clean,
    //       therefore we do it here manually for Root Comp, and child comps are managed the same way.
    this.rootComp.scheduleRendering = this.scheduleRendering.bind( this );
    this.rootComp.indexComp         = this.indexComp.bind( this );
    this.rootComp.listBindExternal  = this.listBindExternal;

    // Index Root Comp
    // Root Comp is an Instance of Component, therefore it is indexed the same way as every other Comp Inst.
    this.indexComp( this.rootComp );

    // Schedule render the very first time
    this.rootComp.scheduleRendering( this.rootComp );

    // Inject Root Comp into DOM
    this.domRoot.insertAdjacentElement( 'afterbegin', this.rootComp.dom );
  };

  registerBindingBuiltIn() {
    // Register Global 'gui-click' Built in Event Handler
    this.registerBinding('gui-click', 'click', function (nameHandler, domNode, evt) {
      if (typeof this[nameHandler] === 'undefined') {
        console.warn(`Game GUI: click handler called "${nameHandler}" can't be found on the Component (type === '${this.type}', id: ${this.id}).`);
        return;
      }

      this[nameHandler].call(this, domNode, 'click', evt);
    });
  }

  scheduleRendering (comp) {
    if ( !comp || !comp.id ) {
      throw('Non-standard Comp passed in to be scheduled. Comp is either undefined or Comp ID is undefined or null or Empty string etc..');
    }

    this.isRenderingDue = true;
    this.listObjIdRenderingScheduled[ comp.id ] = comp;
  };

  render () {
    // Skipp rendering if there was no change
    if (!this.isRenderingDue) {
      return false;
    }

    // Render any Comp. that is scheduled
    for (let idComp in this.listObjIdRenderingScheduled) {
      let comp = this.listObjIdRenderingScheduled[ idComp ];

      // Recover stored data passed in from Parent Comp previously, and pass it along to Comp Rendering.
      let dataFromParentPrev = typeof comp.dataFromParentAsStringPrev !== 'undefined' ?
        JSON.parse( comp.dataFromParentAsStringPrev ) :
        undefined;

      comp.renderToHtmlAndDomify( dataFromParentPrev );
      delete this.listObjIdRenderingScheduled[ idComp ];
    }

    this.isRenderingDue = false;

    // Fire Event Listeners (if any)
    if( !this.isDOMContentReady ) {
      this.isDOMContentReady = true;
      this.fireEventListener('DOMContentReady');
    }
    this.fireEventListener('rendered');

    return true;
  };

  addEventListener( typeEvent, callback ) {
    this.listObjTypeListEventListener[typeEvent] = this.listObjTypeListEventListener[typeEvent] || [];
    this.listObjTypeListEventListener[typeEvent].push( {typeEvent, callback} );
  }

  fireEventListener( typeEvent ) {
    const listEventListener = this.listObjTypeListEventListener[ typeEvent ];

    if (typeof listEventListener === 'undefined') return;

    for (let indexListEventListener = 0; indexListEventListener < listEventListener.length; indexListEventListener++) {
      const eventListener = listEventListener[ indexListEventListener ];
      eventListener.callback( eventListener.typeEvent );
    }
  }

  indexComp( comp ) {
    // Index Comps by Type
    this.listObjTypeComp[ comp.type ] = this.listObjTypeComp[ comp.type ] || [];
    this.listObjTypeComp[ comp.type ].push( comp );

    // Check for Duplicate Comp ID
    if (this.listObjIdComp[ comp.id ]) {
      throw `Duplicate Comp ID is not allowed. Comp Type "${comp.type}", ID in question: ${comp.id}`;
    }

    // Index Comps by ID
    this.listObjIdComp[ comp.id ] = comp;
  };

  getCompByType ( type ) {
    // todo: feel free to remove remove after 20200101
    console.warn('Deprecated: "getCompByType( type )". Use "getListCompByType( type )" instead. "getCompByType( type )" will not be supported after end of 2019.');
    return this.listObjTypeComp[ type ];
  }

  getListCompByType ( type ) {
    return this.listObjTypeComp[ type ];
  }

  getCompById ( id ) {
    return this.listObjIdComp[ id ];
  }

  getDomRoot() {
    return this.domRoot;
  }

  registerBinding(nameAttribute, typeEvent, callback ) {
    this.listBindExternal.push( {nameAttribute, typeEvent, callback} );
  }
}

/***/ }),

/***/ "./src/Rout.js":
/*!*********************!*\
  !*** ./src/Rout.js ***!
  \*********************/
/*! exports provided: Rout, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Rout", function() { return Rout; });
/* harmony import */ var _Component_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Component.js */ "./src/Component.js");
/* harmony import */ var _Router_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Router.js */ "./src/Router.js");



class Rout extends _Component_js__WEBPACK_IMPORTED_MODULE_0__["Component"] {
  afterInstantiation ( path ) {
    _Router_js__WEBPACK_IMPORTED_MODULE_1__["router"].subToHashChange( path, pathListSub => {
      this.setState({
        idChange: this.uid(),
      });
    });
  }

  render( path ) {
    // Return the Comp that matches the Path provided - Partial Match to the Left works.
    return _Router_js__WEBPACK_IMPORTED_MODULE_1__["router"].runIfPathMatch( path, dataInHash =>
      /*
        Note: "this.config" is the "CompToRenderWhenPathTriggered".
              This is counter intuitive but simplifies the API of a Rout.

        When we include a new Rout
        ..${this.include(GameGUI.Rout, 'my/path', CompToRenderWhenPathTriggered)}..
        You can see that "CompToRenderWhenPathTriggered" becomes "this.config".
        ..${this.include(ClassComp, dataFromParent, config)}..
        ClassComp: GameGUI.Rout, dataFromParent: 'my/path', config: CompToRenderWhenPathTriggered
      */
      (this.include(this.config, dataInHash))
    );
  }
}

/* harmony default export */ __webpack_exports__["default"] = (Rout);

/***/ }),

/***/ "./src/Router.js":
/*!***********************!*\
  !*** ./src/Router.js ***!
  \***********************/
/*! exports provided: Router, router */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Router", function() { return Router; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "router", function() { return router; });
class Router {
  constructor() {
    this.listObjRoutParsedCurrent = {};
    this.listSub                  = [];
    this.listObjPathListSub       = {}; // note: this is for debugging only

    window.addEventListener("hashchange", this.handlerHashChange.bind( this ), false);
    this.handlerHashChange();
  }

  init( gui ) {
    gui.registerBinding('gui-href', 'click', url => {
      this.updateHash( url );
    });
  }

  getHash( hashInput ) {
    // Filter off "#"
    // Note: no str.replace(..) cos its slow
    const hashUpdate = hashInput || location.hash;
    const hashRawParts = hashUpdate.split('#');

    if ( 2 < hashRawParts.length ) {
      throw 'Only one "#" is allowed in the URL.';
    }

    return hashRawParts.join('');
  }

  getListRout( hashInput ) {
    const hash = this.getHash( hashInput );

    // Single Rout in hash
    if (hash.indexOf('|') === -1 ) {
      return [hash];

      // Multiple Routs in hash
    } else {
      return hash.split('|')
        .filter( rout => rout !== '');
    }
  }

  processRout( rout ) {
    const routProcessed = {
      id:               null,
      listObjAttribute: {},
      path:             null
    };

    let routRemaining;
    // Find "id" in Rout if any. Not having "id" is valid syntax
    // E.g: "gui:menu/main" => id === 'gui', or "menu/main" => id === undefined.
    // Note: "#" is already removed from Rout
    if ( rout.indexOf(':') !== -1 ) {
      const routListPartById = rout.split(':');
      routProcessed.id = routListPartById[ 0 ];
      routRemaining = routListPartById[ 1 ];
    } else {
      routProcessed.id = 'noId';
      routRemaining = rout;
    }

    // If at least one Attribute provided in Rout
    if ( routRemaining.indexOf('?') !== -1 ) {
      const listPartByQuestionmark = routRemaining.split('?');
      routProcessed.path      = listPartByQuestionmark[0];
      const strListAttribute  = listPartByQuestionmark[1];
      const listAttributeStr  = strListAttribute.split('&');

      // Turn Attribute String into Attribute Key Value Pair.
      // E.g. "user=Jane" => listObjAttribute['user'] = 'Jane';
      // E.g. "foo"       => listObjAttribute['foo']  = true;
      listAttributeStr.forEach(attributeStr => {
        if ( attributeStr.indexOf('=') !== -1 ) {
          const listPartByEqualSign = attributeStr.split('=');
          routProcessed.listObjAttribute[ listPartByEqualSign[0] ] = listPartByEqualSign[1];
        } else {
          routProcessed.listObjAttribute[ attributeStr ] = true;
        }
      });

      // If NO Attribute is provided in Rout
    } else {
      routProcessed.path = routRemaining;
    }

    return routProcessed;
  }

  handlerHashChange () {
    const listRoutStr = this.getListRout();
    const listObjRoutParsedCurrentUpdate = {};
    listRoutStr.forEach( routStr => {
      const routObj = this.processRout( routStr );
      listObjRoutParsedCurrentUpdate[ routObj.id ] = routObj;
    });

    this.listObjRoutParsedCurrent = listObjRoutParsedCurrentUpdate;

    this.fireAllSub();
  }

  subToHashChange ( pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch ) {
    this.listSub.push( fnToCallIfMatch );
    this.subToPath ( pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch ); // note: this is for debugging only
    this.handlerHashChange();
  }

  subToPath ( pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch ) {
    const listSub = this.listObjPathListSub[ pathToMatch ] = this.listObjPathListSub[ pathToMatch ] || [];
    listSub.push( {pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch} );
  }

  runIfPathMatch ( pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch, singleActivation ) {
    let routParsedCurrentMatching;

    // Filter off Path ID from "pathToMatch"
    // E.g. "somePathId:my/path" -> pathToMatch = "my/path"; idToMatch = 'somePathId'
    let listPartPath = pathToMatch.split(':');
    let idToMatch = 1 < listPartPath.length ? listPartPath[0] : 'noId';
    pathToMatch   = 1 < listPartPath.length ? listPartPath[1] : listPartPath[0];

    // Search
    // Iterate List of Current Routs/Paths
    for ( let idListRout in this.listObjRoutParsedCurrent) {
      const routParsedCurrent = this.listObjRoutParsedCurrent[ idListRout ];

      // If Current Routs/Paths Iter matching Path that we are searching for
      if (routParsedCurrent.id === idToMatch &&
        // Note: Partial Matching to Left: Match it only to the left, e.g.: main/setting & main/setting/audio
        routParsedCurrent.path.indexOf(pathToMatch) === 0
      ) {
        routParsedCurrentMatching = routParsedCurrent;
      }
    }

    // Matching
    // If there is a matching Subscriber/Rout
    if ( routParsedCurrentMatching ) {
      // If "fnToCallIfMatch" should be called once in subsequent matching Paths
      if ( singleActivation ) {
        // If Path was inactive up to now
        if ( !fnToCallIfMatch.isActive ) {
          fnToCallIfMatch.isActive = true;
          fnToCallIfMatch.listObjAttribute = routParsedCurrentMatching.listObjAttribute;
          return fnToCallIfMatch( routParsedCurrentMatching.listObjAttribute );

          // If Path was inactivated by prev path
        } else {
          return '';
        }

      } else {
        return fnToCallIfMatch( routParsedCurrentMatching.listObjAttribute );
      }

      // NOT Matching
      // If there is NO matching Subscriber/Rout, and we have a Callback to call when doesnt match
    } else if ( typeof fnToCallIfDoesntMatch !== 'undefined' ) {
      // If Rout was active with prev Path
      // Note: it makes sure that "fnToCallIfDoesntMatch" is called only once
      if (fnToCallIfMatch.isActive) {
        fnToCallIfMatch.isActive = false;
        fnToCallIfDoesntMatch( fnToCallIfMatch.listObjAttribute );
        fnToCallIfMatch.listObjAttribute = null;
      }

      return '';

    } else {
      return '';
    }
  }

  fireAllSub () {
    for (let indexListSub = 0; indexListSub < this.listSub.length; indexListSub++) {
      const sub = this.listSub[ indexListSub ];
      sub();
    }
  }

  rout ( pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch ) {
    this.subToHashChange( pathToMatch, () => {
      this.runIfPathMatch( pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch, true );
    }, fnToCallIfDoesntMatch );
  }

  updateHash ( hashNew ) {
    // Collect List of Routs as List of Strings rep. Routs
    const listRoutStr = this.getListRout( hashNew );

    // Process List of Routs as String to Obj
    const listObjRoutParsedNew = {};
    listRoutStr.forEach( routStr => {
      const routObj = this.processRout( routStr );
      listObjRoutParsedNew[ routObj.id ] = routObj;
    });

    // Update List of Hash on record
    const listObjRoutParsedUpdate = {
      ...this.listObjRoutParsedCurrent,
      ...listObjRoutParsedNew
    };

    const hashUpdated = this.reconstructHash( listObjRoutParsedUpdate );
    location.hash = hashUpdated;
  }

  reconstructHash( listObjByIdRoutObj ) {
    let hashReconstructed = '';

    // Multiple Rout Objects
    if ( 1 < Object.keys(listObjByIdRoutObj).length ) {
      let ctrRout = 0;

      // Iterate over the List of Rout Objects
      for (let idRoutObj in listObjByIdRoutObj) {
        const routObjIter = listObjByIdRoutObj[ idRoutObj ];

        // Add Rout Divider "|" if there are multiple Routs
        if (ctrRout) hashReconstructed += '|';

        // Reconstruct first part, ID + Path
        hashReconstructed += routObjIter.id + ':' + routObjIter.path;

        // Reconstruct Attributes from Rout Iter to Hash format, if any
        hashReconstructed = this.reconstructHashAttributeAll( hashReconstructed, routObjIter );

        ctrRout++;
      }

      // Single Rout on record
    } else {
      const idRoutObj = Object.keys( listObjByIdRoutObj )[ 0 ];
      const routObj = listObjByIdRoutObj[ idRoutObj ];

      // Reconstruct first part, ID + Path
      hashReconstructed += routObj.id + ':' + routObj.path;

      // Reconstruct Attributes from Rout to Hash format, if any. E.g.: ..bar=2&foo&..
      hashReconstructed = this.reconstructHashAttributeAll( hashReconstructed, routObj );
    }

    return hashReconstructed;
  }

  reconstructHashAttributeAll( hashReconstructed, routObj ) {
    // If Rout Iter contains Attributes
    if ( 0 < Object.keys(routObj.listObjAttribute).length ) {
      hashReconstructed += '?';
      let ctrAttribute = 0;

      // Iterate over Rout Attributes
      Object.keys( routObj.listObjAttribute ).forEach( attributeKey => {
        const attributeValue = routObj.listObjAttribute[ attributeKey ];

        // Add Attribute Divider "&" if there are multiple Attributes
        if ( 0 < ctrAttribute ) hashReconstructed += '&';

        // If Boolean Attribute, e.g.: ..bar=2&foo&.. => foo === true
        if ( typeof attributeValue === 'boolean' ) {
          hashReconstructed += attributeKey;

          // Any type of Attribute but Boolean
        } else {
          hashReconstructed += attributeKey + '=' + routObj.listObjAttribute[ attributeKey ];
        }

        ctrAttribute++;
      });
    }

    return hashReconstructed;
  }
}

// Export a Single Router Instance, because we only want one Router that is aware of all the Routs
const router = new Router();

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: Component, router, Rout, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _GameGUI_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./GameGUI.js */ "./src/GameGUI.js");
/* harmony import */ var _Component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Component */ "./src/Component.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Component", function() { return _Component__WEBPACK_IMPORTED_MODULE_1__["Component"]; });

/* harmony import */ var _router_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./router.js */ "./src/router.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "router", function() { return _router_js__WEBPACK_IMPORTED_MODULE_2__["router"]; });

/* harmony import */ var _Rout_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Rout.js */ "./src/Rout.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Rout", function() { return _Rout_js__WEBPACK_IMPORTED_MODULE_3__["Rout"]; });







/* harmony default export */ __webpack_exports__["default"] = (_GameGUI_js__WEBPACK_IMPORTED_MODULE_0__["GameGUI"]);

/***/ }),

/***/ "./src/router.js":
/*!***********************!*\
  !*** ./src/router.js ***!
  \***********************/
/*! exports provided: Router, router */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Router", function() { return Router; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "router", function() { return router; });
class Router {
  constructor() {
    this.listObjRoutParsedCurrent = {};
    this.listSub                  = [];
    this.listObjPathListSub       = {}; // note: this is for debugging only

    window.addEventListener("hashchange", this.handlerHashChange.bind( this ), false);
    this.handlerHashChange();
  }

  init( gui ) {
    gui.registerBinding('gui-href', 'click', url => {
      this.updateHash( url );
    });
  }

  getHash( hashInput ) {
    // Filter off "#"
    // Note: no str.replace(..) cos its slow
    const hashUpdate = hashInput || location.hash;
    const hashRawParts = hashUpdate.split('#');

    if ( 2 < hashRawParts.length ) {
      throw 'Only one "#" is allowed in the URL.';
    }

    return hashRawParts.join('');
  }

  getListRout( hashInput ) {
    const hash = this.getHash( hashInput );

    // Single Rout in hash
    if (hash.indexOf('|') === -1 ) {
      return [hash];

      // Multiple Routs in hash
    } else {
      return hash.split('|')
        .filter( rout => rout !== '');
    }
  }

  processRout( rout ) {
    const routProcessed = {
      id:               null,
      listObjAttribute: {},
      path:             null
    };

    let routRemaining;
    // Find "id" in Rout if any. Not having "id" is valid syntax
    // E.g: "gui:menu/main" => id === 'gui', or "menu/main" => id === undefined.
    // Note: "#" is already removed from Rout
    if ( rout.indexOf(':') !== -1 ) {
      const routListPartById = rout.split(':');
      routProcessed.id = routListPartById[ 0 ];
      routRemaining = routListPartById[ 1 ];
    } else {
      routProcessed.id = 'noId';
      routRemaining = rout;
    }

    // If at least one Attribute provided in Rout
    if ( routRemaining.indexOf('?') !== -1 ) {
      const listPartByQuestionmark = routRemaining.split('?');
      routProcessed.path      = listPartByQuestionmark[0];
      const strListAttribute  = listPartByQuestionmark[1];
      const listAttributeStr  = strListAttribute.split('&');

      // Turn Attribute String into Attribute Key Value Pair.
      // E.g. "user=Jane" => listObjAttribute['user'] = 'Jane';
      // E.g. "foo"       => listObjAttribute['foo']  = true;
      listAttributeStr.forEach(attributeStr => {
        if ( attributeStr.indexOf('=') !== -1 ) {
          const listPartByEqualSign = attributeStr.split('=');
          routProcessed.listObjAttribute[ listPartByEqualSign[0] ] = listPartByEqualSign[1];
        } else {
          routProcessed.listObjAttribute[ attributeStr ] = true;
        }
      });

      // If NO Attribute is provided in Rout
    } else {
      routProcessed.path = routRemaining;
    }

    return routProcessed;
  }

  handlerHashChange () {
    const listRoutStr = this.getListRout();
    const listObjRoutParsedCurrentUpdate = {};
    listRoutStr.forEach( routStr => {
      const routObj = this.processRout( routStr );
      listObjRoutParsedCurrentUpdate[ routObj.id ] = routObj;
    });

    this.listObjRoutParsedCurrent = listObjRoutParsedCurrentUpdate;

    this.fireAllSub();
  }

  subToHashChange ( pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch ) {
    this.listSub.push( fnToCallIfMatch );
    this.subToPath ( pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch ); // note: this is for debugging only
    this.handlerHashChange();
  }

  subToPath ( pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch ) {
    const listSub = this.listObjPathListSub[ pathToMatch ] = this.listObjPathListSub[ pathToMatch ] || [];
    listSub.push( {pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch} );
  }

  runIfPathMatch ( pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch, singleActivation ) {
    let routParsedCurrentMatching;

    // Filter off Path ID from "pathToMatch"
    // E.g. "somePathId:my/path" -> pathToMatch = "my/path"; idToMatch = 'somePathId'
    let listPartPath = pathToMatch.split(':');
    let idToMatch = 1 < listPartPath.length ? listPartPath[0] : 'noId';
    pathToMatch   = 1 < listPartPath.length ? listPartPath[1] : listPartPath[0];

    // Search
    // Iterate List of Current Routs/Paths
    for ( let idListRout in this.listObjRoutParsedCurrent) {
      const routParsedCurrent = this.listObjRoutParsedCurrent[ idListRout ];

      // If Current Routs/Paths Iter matching Path that we are searching for
      if (routParsedCurrent.id === idToMatch &&
        // Note: Partial Matching to Left: Match it only to the left, e.g.: main/setting & main/setting/audio
        routParsedCurrent.path.indexOf(pathToMatch) === 0
      ) {
        routParsedCurrentMatching = routParsedCurrent;
      }
    }

    // Matching
    // If there is a matching Subscriber/Rout
    if ( routParsedCurrentMatching ) {
      // If "fnToCallIfMatch" should be called once in subsequent matching Paths
      if ( singleActivation ) {
        // If Path was inactive up to now
        if ( !fnToCallIfMatch.isActive ) {
          fnToCallIfMatch.isActive = true;
          fnToCallIfMatch.listObjAttribute = routParsedCurrentMatching.listObjAttribute;
          return fnToCallIfMatch( routParsedCurrentMatching.listObjAttribute );

          // If Path was inactivated by prev path
        } else {
          return '';
        }

      } else {
        return fnToCallIfMatch( routParsedCurrentMatching.listObjAttribute );
      }

      // NOT Matching
      // If there is NO matching Subscriber/Rout, and we have a Callback to call when doesnt match
    } else if ( typeof fnToCallIfDoesntMatch !== 'undefined' ) {
      // If Rout was active with prev Path
      // Note: it makes sure that "fnToCallIfDoesntMatch" is called only once
      if (fnToCallIfMatch.isActive) {
        fnToCallIfMatch.isActive = false;
        fnToCallIfDoesntMatch( fnToCallIfMatch.listObjAttribute );
        fnToCallIfMatch.listObjAttribute = null;
      }

      return '';

    } else {
      return '';
    }
  }

  fireAllSub () {
    for (let indexListSub = 0; indexListSub < this.listSub.length; indexListSub++) {
      const sub = this.listSub[ indexListSub ];
      sub();
    }
  }

  rout ( pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch ) {
    this.subToHashChange( pathToMatch, () => {
      this.runIfPathMatch( pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch, true );
    }, fnToCallIfDoesntMatch );
  }

  updateHash ( hashNew ) {
    // Collect List of Routs as List of Strings rep. Routs
    const listRoutStr = this.getListRout( hashNew );

    // Process List of Routs as String to Obj
    const listObjRoutParsedNew = {};
    listRoutStr.forEach( routStr => {
      const routObj = this.processRout( routStr );
      listObjRoutParsedNew[ routObj.id ] = routObj;
    });

    // Update List of Hash on record
    const listObjRoutParsedUpdate = {
      ...this.listObjRoutParsedCurrent,
      ...listObjRoutParsedNew
    };

    const hashUpdated = this.reconstructHash( listObjRoutParsedUpdate );
    location.hash = hashUpdated;
  }

  reconstructHash( listObjByIdRoutObj ) {
    let hashReconstructed = '';

    // Multiple Rout Objects
    if ( 1 < Object.keys(listObjByIdRoutObj).length ) {
      let ctrRout = 0;

      // Iterate over the List of Rout Objects
      for (let idRoutObj in listObjByIdRoutObj) {
        const routObjIter = listObjByIdRoutObj[ idRoutObj ];

        // Add Rout Divider "|" if there are multiple Routs
        if (ctrRout) hashReconstructed += '|';

        // Reconstruct first part, ID + Path
        hashReconstructed += routObjIter.id + ':' + routObjIter.path;

        // Reconstruct Attributes from Rout Iter to Hash format, if any
        hashReconstructed = this.reconstructHashAttributeAll( hashReconstructed, routObjIter );

        ctrRout++;
      }

      // Single Rout on record
    } else {
      const idRoutObj = Object.keys( listObjByIdRoutObj )[ 0 ];
      const routObj = listObjByIdRoutObj[ idRoutObj ];

      // Reconstruct first part, ID + Path
      hashReconstructed += routObj.id + ':' + routObj.path;

      // Reconstruct Attributes from Rout to Hash format, if any. E.g.: ..bar=2&foo&..
      hashReconstructed = this.reconstructHashAttributeAll( hashReconstructed, routObj );
    }

    return hashReconstructed;
  }

  reconstructHashAttributeAll( hashReconstructed, routObj ) {
    // If Rout Iter contains Attributes
    if ( 0 < Object.keys(routObj.listObjAttribute).length ) {
      hashReconstructed += '?';
      let ctrAttribute = 0;

      // Iterate over Rout Attributes
      Object.keys( routObj.listObjAttribute ).forEach( attributeKey => {
        const attributeValue = routObj.listObjAttribute[ attributeKey ];

        // Add Attribute Divider "&" if there are multiple Attributes
        if ( 0 < ctrAttribute ) hashReconstructed += '&';

        // If Boolean Attribute, e.g.: ..bar=2&foo&.. => foo === true
        if ( typeof attributeValue === 'boolean' ) {
          hashReconstructed += attributeKey;

          // Any type of Attribute but Boolean
        } else {
          hashReconstructed += attributeKey + '=' + routObj.listObjAttribute[ attributeKey ];
        }

        ctrAttribute++;
      });
    }

    return hashReconstructed;
  }
}

// Export a Single Router Instance, because we only want one Router that is aware of all the Routs
const router = new Router();

/***/ })

/******/ });
});
//# sourceMappingURL=GameGUI.js.map