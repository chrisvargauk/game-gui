export class Component {
  constructor ( option, config = {}) {
    this.option                     = option;
    this.config                     = config;
    this.id                         = typeof config.id !== 'undefined' ? config.id : this.uid();
    this.type                       = this.getTypeOfComp(this);
    this.dom                        = this.createDomElement ( this.type, this.id );
    this.listObjCompChild           = {};
    this.html                       = '';
    this.ctrChild                   = -1;
    this.state                      = {};
    this.isStateUpdated             = false;
    this.dataFromParentAsStringPrev = undefined;
  }

  createDomElement ( type, id ) {
    const domElement = document.createElement('div');
    domElement.classList.add( this.camelCaseToNakeCase( type ) );
    domElement.setAttribute('id', id);

    return domElement;
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
    } else if (typeof dataFromParent !== 'undefined') {
      this.dataFromParentAsStringPrev = JSON.stringify( dataFromParent );
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

  include ( ClassComp, dataFromParent, config ) {
    // If Smart Comp (Class)
    if ( ClassComp.prototype instanceof Component ) {
      this.ctrChild++;
      var nameComp  = ClassComp.name;
      var compChild = this.listObjCompChild[ this.ctrChild ];

      // Create new instance of Comp only if it hasn't been created yet
      if ( typeof compChild === 'undefined' ) {
        compChild = this.listObjCompChild[ this.ctrChild ] = new ClassComp( this.option, config );
        compChild.dataFromParent = dataFromParent;

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

      compChild.renderToHtmlAndDomify( compChild.dataFromParent );

      return `<div class="comp-placeholder" type="${nameComp}" ctr-child="${this.ctrChild}"></div>`;

    // If Dumb Comp (Function)
    } else {
      return ClassComp( dataFromParent, this.option );
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

  camelCaseToNakeCase (str) {
    return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase()
  }

  uid () {
    return Date.now()+''+Math.round(Math.random() * 100000);
  }

  getTypeOfComp ( comp ) {
    // Issue: Babel transpiles MyCompName to MyCompName_ImportedCompName. We are filtering this off here.
    //        If we ignored this, the code wouldn't be compilable.
    const type = Object.getPrototypeOf(comp).constructor.name;
    const listTypePart = type.split('_');
    return listTypePart[ listTypePart.length -1 ];
  }
}

export default Component;