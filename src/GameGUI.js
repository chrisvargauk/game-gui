export class GameGUI {
  constructor(RootComp, selectorGuiRoot, option) {
    // Reg Root Comp automatically if requirements are fulfilled
    // Note: don't run it by default, you may want to control the steps.
    if (typeof RootComp === 'undefined' ||
        typeof selectorGuiRoot === 'undefined'
    ) {
      return;
    }

    this.init(option);
    this.regRootComp(RootComp, selectorGuiRoot);

    // Call the very first render ASAP
    // Note:  Otherwise you might see a brief flash
    //        Running render in the constructor means, all includes will be called recursively,
    //        therefore all Comp / SubC omp Instantiation will happen sequentially when Game GUI is Instantiated.
    //        That said, all Comps are indexed and ready to be accessed right after Game GUI Instantiation.
    this.render();
  };

  init(option = {}) {
    this.optionDefault = {
      fps: 60,
    };

    this.option = {
      ...this.optionDefault,
      ...option,
    };

    this.isRenderingDue = false;
    this.listObjIdRenderingScheduled = {};

    // Indexed list of all rendered Comps
    this.listObjTypeComp = {};
    this.listObjIdComp = {};

    this.listObjCallback = {
      listOnRender: [],
    };

    // Note: Don't worry about calling render 60 times a sec,
    // render method start with "if(!this.isRenderingDue ) return;"
    this.tokenUiRender;
    if (typeof interval !== 'undefined') {
      this.tokenUiRender = interval.setInterval(this.render.bind(this), Math.floor(1000/this.option.fps));
    } else {
      this.tokenUiRender = setInterval(this.render.bind(this), Math.floor(1000/this.option.fps));
    }
  }

  regRootComp (RootComp, selectorGuiRoot) {
    // Get UI Root
    this.domRoot = document.querySelector(selectorGuiRoot);

    // Skip if root DOM Element doesn't exist
    if (this.domRoot === null) {
      throw('ERROR: DOM Root can\'t be found by using the provided selector: ' + selectorGuiRoot);
    }

    // Instantiate Root Comp
    this.rootComp = new RootComp( this.option );

    // Hook up Game GUI Methods: scheduler, indexComp
    // Note: we dont want to pass in scheduler into comps, we want to keep comp constructor clean,
    //       therefore we do it here manually for Root Comp, and child comps are managed the same way.
    this.rootComp.scheduleRendering = this.scheduleRendering.bind( this );
    this.rootComp.indexComp         = this.indexComp.bind( this );

    // Index Root Comp
    // Root Comp is an Instance of Component, therefore it is indexed the same way as every other Comp Inst.
    this.indexComp( this.rootComp );

    // Schedule render the very first time
    this.rootComp.scheduleRendering( this.rootComp );

    // Inject Root Comp into DOM
    this.domRoot.insertAdjacentElement( 'afterbegin', this.rootComp.dom );
  };

  scheduleRendering (comp) {
    this.isRenderingDue = true;
    this.listObjIdRenderingScheduled[comp.id] = comp;
  };

  render () {
    // Skipp rendering if there was no change
    if (!this.isRenderingDue) {
      return;
    }

    // Render any Comp. that is scheduled
    for (let idComp in this.listObjIdRenderingScheduled) {
      let comp = this.listObjIdRenderingScheduled[ idComp ];

      let dataFromParentPrev = typeof comp.dataFromParentAsStringPrev !== 'undefined' ?
        JSON.parse( comp.dataFromParentAsStringPrev ) :
        undefined;

      comp.renderToHtmlAndDomify( dataFromParentPrev );
      delete this.listObjIdRenderingScheduled[ idComp ];
    }

    this.isRenderingDue = false;

    // Call all the render event handlers passed in externally
    if( 0 < this.listObjCallback.listOnRender.length ) {
      for(let indexListOnRender=0; indexListOnRender<this.listObjCallback.listOnRender.length; indexListOnRender++) {
        this.listObjCallback.listOnRender[ indexListOnRender ]();
      }
    }
  };

  onRender ( callback ) {
    this.listObjCallback.listOnRender.push( callback );
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
    return this.listObjTypeComp[ type ];
  }

  getCompById ( id ) {
    return this.listObjIdComp[ id ];
  }
}

export * from './Component';
export * from './GameGUIRouter';
export default GameGUI;