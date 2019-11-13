export class Component {
  constructor ( option = {}, config = {}, dataFromParent = {} ) {
    // Note: "option" and "config" are registered at first include when Comp is instantiated.
    //       These props wont be updated even if then change at subsequent rerenderings.
    this.option                     = option;
    this.config                     = config;

    this.id                         = typeof config.id !== 'undefined' ? config.id : this.uid();
    this.type                       = this.getTypeOfComp(this);
    this.dom                        = this.createDomRepresentation ( this.type, this.id );
    this.listObjCompChild           = {};
    this.html                       = '';
    this.ctrChild                   = -1;
    this.state                      = {};
    this.isStateUpdated             = false;
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

  createDomRepresentation ( type, id ) {
    const domElement = document.createElement('div');
    domElement.classList.add( this.camelCaseToSnakeCase( type ) );
    domElement.setAttribute('id', id);

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
      this.ctrChild++;
      var nameComp  = ClassComp.name;
      var compChild = this.listObjCompChild[ this.ctrChild ];

      // Create new instance of Comp only if it hasn't been created yet
      if ( typeof compChild === 'undefined' ) {
        compChild = this.listObjCompChild[ this.ctrChild ] = new ClassComp( this.option, config, dataFromParent );
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
        //       and not to comp instance.
        //       These hooked up methods wont be called at constructon time,
        //       therefore there is no problem hooking them up after Comp Instantiation.
        compChild.scheduleRendering = this.scheduleRendering;
        compChild.indexComp         = this.indexComp;

        // Index Comp right after its created and even before its rendered.
        // Note: The rendering of Root Comp will trigger the indexing of all Sub Comps.
        this.indexComp( compChild );
      }

      compChild.renderToHtmlAndDomify( dataFromParent );
      // Note: "dataFromParent" from Parent Comp is updated in Child Comp by "include", but
      //       "config" and "option" are not, they are passed in only at first inclusion (at Comp Instantiation)

      return `<div class="comp-placeholder" type="${nameComp}" ctr-child="${this.ctrChild}">placeholder text</div>`;

    // If Dumb Comp (Function)
    } else {
      return ClassComp( dataFromParent, this.option );
    }
  };

  renderToHtmlAndDomify ( dataFromParent ) {
    // Optimise Rendering to HTML
    // Note: Comp HTML Representation can change one of two ways:
    //       A) Data Passed in from Parent Comp has changed
    //       B) State has changed
    //       C) HTML Representation of Comp has never been created before, therefore
    //          what ever we render will be different from current HTML Representation of the Comp.
    //
    // Don't skip if HTML representation of Comp has never been rendered yet.
    if ( this.html !== '' ) {
      const renderBecauseDataPassedInChanged = this.isRenderBecauseDataPassedInChanged ( dataFromParent );

      // Skip only if Data Passed In From Parent Comp hasen't changed and the sate of the Comp hasen't changed either
      if ( !renderBecauseDataPassedInChanged &&
           !this.isStateUpdated
      ) {
        return false;
      }
    }

    // Note: Record of Data Passed In From Parent has already been updated by "isRenderBecauseDataPassedInChanged"
    //       because we have already stringified Data Passed In From Parent in "isRenderBecauseDataPassedInChanged",
    //       therefore we don't want to do it twice, efficiency
    // this.dataFromParentAsStringPrev = JSON.stringify( dataFromParent );

    // Render to HTML String
    this.ctrChild       = -1;
    var htmlNewRender   = this.render( dataFromParent );
    this.isStateUpdated = false;
    this.ctrChild       = -1;

    // Skip ReDomify if Comp Shallow Render looks the same
    // Note: if the Data Passed In From Parent has changed and/or Comp State has changed,
    //       that doesnt necessarily mean that the rendered html is different
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


  // # Utility
  // # #######

  camelCaseToSnakeCase (str) {
    return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase()
  }

  uid () {
    return Date.now()+''+Math.round(Math.random() * 100000);
  }
}

export default Component;