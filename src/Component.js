export class Component {
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
    this.html                       = null;
    this.ctrChildByType             = {};

    this.state                      = {};
    this.isStateUpdated             = false; // when Comp State is updated, this is set to true till
                                             // State Change is rendered to HTML/DOM
    this.dataFromParentAsStringPrev = undefined;
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
        compChild.gameGUI           = this.gameGUI;

        // Index Comp (by "type" and "id") for quick access, right after its created and even before its rendered.
        // Note: The rendering of Root Comp will trigger the indexing of all Sub Comps.
        this.indexComp( compChild );

        // Run Life Cycle Method if defined on Comp Instance
        if  (typeof compChild.afterInstantiation !== 'undefined') {
          compChild.afterInstantiation( dataFromParent );
        }
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
    if (this.html !== null &&
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

    // Hide Component - DOM Node included, if Component has nothing to render
    if (this.html === '') {
      this.dom.style.visibility = 'hidden';
    } else {
      this.dom.style.visibility = 'visible';
    }

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