var GameUI = function () {
  this.init = function (fps = 60) {
    this.isRenderingDue = false;
    this.listObjIdRenderingScheduled = {};

    // Note: Don't worry about calling render 60 times a sec,
    // render method start with "if(!this.isRenderingDue ) return;"
    this.tokenUiRender;
    if ( typeof interval !== 'undefined') {
      this.tokenUiRender = interval.setInterval( this.render.bind( this ), fps);
    } else {
      this.tokenUiRender = setInterval( this.render.bind( this ), fps);
    }
  };

  this.scheduleRendering = function ( comp) {
    this.isRenderingDue = true;

    this.listObjIdRenderingScheduled[ comp.id ] = comp;
  };

  this.render = function () {
    // Skipp rendering if there was no change
    if ( !this.isRenderingDue ) {
      return;
    }

    // this.rootComp.renderToHtmlAndDomify();

    for (let idComp in this.listObjIdRenderingScheduled) {
      let comp = this.listObjIdRenderingScheduled[ idComp ];

      let dataFromParentPrev = typeof comp.dataFromParentAsStringPrev !== 'undefined' ?
        JSON.parse(comp.dataFromParentAsStringPrev) :
        undefined;

      comp.renderToHtmlAndDomify( dataFromParentPrev );
      delete this.listObjIdRenderingScheduled[ idComp ];
    }

    this.isRenderingDue = false;
  };

  this.regRootComp = function ( RootComp, selectorUiNativeRoot ) {
    // Get UI Root
    this.domRoot = document.querySelector( selectorUiNativeRoot);

    // Skip if root DOM Element doesn't exist
    if ( this.domRoot === null ) {
      throw('ERROR: DOM Root can\'t be found by using the provided selector: '+selectorUiNativeRoot);
    }

    // Instantiate Root Comp
    this.rootComp = new RootComp();

    // Hook up scheduler
    // Note: we dont want to pass in scheduler into comps, we want to keep comp contructior clean,
    //       therefore we do it here manually for Root Comp, and child comps are managed the same way.
    this.rootComp.scheduleRendering = this.scheduleRendering.bind( this );

    // Schedule render the very first time
    this.rootComp.scheduleRendering( this.rootComp );

    // Inject Root Comp into DOM
    this.domRoot.insertAdjacentElement('afterbegin', this.rootComp.dom);
  };

  this.start = function () {

  };

  // Note: Instantiation is controlled by Game Engine
  // this.init();
};