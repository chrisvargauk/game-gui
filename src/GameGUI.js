export class GameGUI {
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