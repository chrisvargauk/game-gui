var Component =
/******/ (function(modules) { // webpackBootstrap
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/Component.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/Component.js":
/*!**************************!*\
  !*** ./src/Component.js ***!
  \**************************/
/*! exports provided: Component, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Component", function() { return Component; });
class Component {
  constructor () {
    this.id                         = Date.now() + '-' + Math.random();
    this.listObjCompChild           = {};
    this.html                       = '';
    this.dom                        = document.createElement('div');
    this.ctrChild                   = -1;
    this.state                      = {};
    this.isStateUpdated             = false;
    this.dataFromParentAsStringPrev = undefined;
  }

  renderToHtmlAndDomify ( dataFromParent ) {
    // Skip if Data Passed in from Parent Comp. is the same
    // or if State has changed
    if ( this.html !== '' ) {
      const renderBecauseDataPassedInChanged = this.isRenderBecauseDataPassedInChanged ( dataFromParent );
      if ( !renderBecauseDataPassedInChanged &&
        !this.isStateUpdated
      ) {
        return false;
      }
    }

    // Render to HTML String
    this.ctrChild       = -1;
    var htmlNewRender   = this.render( dataFromParent );
    this.isStateUpdated = false;
    this.ctrChild       = -1;

    // Skip ReDomify if Comp Shallow Render looks the same
    if ( htmlNewRender === this.html) {
      return false;
    }

    this.html = htmlNewRender;

    // DOMify HTML String
    this.dom.innerHTML = this.html;

    // Do predefined bindings automatically right after DOM is ready
    this.doBind();

    // Run Life Cycle Method if defined on Comp Instance
    if  (typeof this.afterRender !== 'undefined') {
      this.afterRender();
    }

    // Inject Child Comps if any
    this.replacePlaceholderAll( this.dom );

    return true;
  }

  isRenderBecauseDataPassedInChanged ( dataFromParent ) {
    // Scenario 1)  prev === undefined && passed === undefined --> DON'T RENDER
    if ( typeof this.dataFromParentAsStringPrev === 'undefined' &&
      typeof dataFromParent                  === 'undefined'
    ) {
      return false;
    }

    // Scenario 2)  prev !== undefined && passed === undefined --> RENDER
    if ( typeof this.dataFromParentAsStringPrev !== 'undefined' &&
      typeof dataFromParent                  === 'undefined'
    ) {
      this.dataFromParentAsStringPrev = dataFromParent;
      return true;
    }

    // Scenario 3)  prev === undefined && passed !== undefined --> COMPARE
    if ( typeof this.dataFromParentAsStringPrev === 'undefined' &&
      typeof dataFromParent                  !== 'undefined'
    ) {
      const dataFromParentAsString = JSON.stringify( dataFromParent );

      // Compare / same       --> DON'T RENDER
      if ( this.dataFromParentAsStringPrev === dataFromParentAsString) {
        return false;

        // Compare / different  --> RENDER
      } else {
        this.dataFromParentAsStringPrev = dataFromParentAsString;
        return true;
      }
    }

    // Scenario 4)  prev !== undefined && passed !== undefined --> COMPARE
    if ( typeof this.dataFromParentAsStringPrev !== 'undefined' &&
      typeof dataFromParent                  !== 'undefined'
    ) {
      const dataFromParentAsString = JSON.stringify( dataFromParent );

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

  replacePlaceholderAll () {
    // Get a list of all Placeholder Child Component
    var nodeListPlaceholder = this.dom.querySelectorAll('.comp-placeholder');

    // Iterate over all Placeholder Child Comps and replace them with Comp DOM
    for (var indexNodeListPlaceholder = 0; indexNodeListPlaceholder < nodeListPlaceholder.length; indexNodeListPlaceholder++) {
      var dPlaceholder = nodeListPlaceholder[ indexNodeListPlaceholder ];
      var compChild = this.listObjCompChild[indexNodeListPlaceholder];
      compChild.dom = dPlaceholder.insertAdjacentElement('beforebegin', compChild.dom);
      dPlaceholder.parentNode.removeChild(dPlaceholder);
    }
  };

  include ( ClassComp, dataFromParent ) {
    // If Smart Comp (Class)
    if ( Function.prototype.toString.call(ClassComp).indexOf('class') === 0 ) {
      this.ctrChild++;
      var nameComp  = ClassComp.name;
      var compChild = this.listObjCompChild[ this.ctrChild ];

      // Create new instance of Comp only if it hasn't been created yet
      if ( typeof compChild === 'undefined' ) {
        compChild = this.listObjCompChild[ this.ctrChild ] = new ClassComp();

        // Hook up scheduler
        // Note: make sure you dont bind this, you need scheduler to resolve to ui framework,
        //       and not to comp instance
        compChild.scheduleRendering = this.scheduleRendering;
        compChild.scheduleRendering( this );
      }

      compChild.renderToHtmlAndDomify( dataFromParent );

      return `<div class="comp-placeholder" type="${nameComp}" ctr-child="${this.ctrChild}"></div>`;

      // If Dumb Comp (Function)
    } else {
      return ClassComp( dataFromParent );
    }
  };

  doBind () {
    // ui-click | Do click handler bindings automatically right after rendering
    // Note: Binding happens before Child Comps are injected so Encapsulation is unharmed
    const listNodeBtn = this.dom.querySelectorAll('[ui-click]');
    for (let indexListNodeBtn = 0; indexListNodeBtn < listNodeBtn.length; indexListNodeBtn++) {
      const nodeBtn = listNodeBtn[ indexListNodeBtn ];

      const handler = nodeBtn.getAttribute('ui-click');
      if (typeof this[handler] === 'undefined') {
        console.warn(`UI: click handler called "${handler}" can't be found on the Component.`);
        continue;
      }

      nodeBtn.addEventListener('click', this[handler].bind(this), false);
    }
  }

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
}

/* harmony default export */ __webpack_exports__["default"] = (Component);

/***/ })

/******/ });
//# sourceMappingURL=Component.js.map