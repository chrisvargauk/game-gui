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
    // Note: Otherwise you might see a brief flash
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

    // Hook up scheduler
    // Note: we dont want to pass in scheduler into comps, we want to keep comp contructior clean,
    //       therefore we do it here manually for Root Comp, and child comps are managed the same way.
    this.rootComp.scheduleRendering = this.scheduleRendering.bind(this);

    // Schedule render the very first time
    this.rootComp.scheduleRendering(this.rootComp);

    // Inject Root Comp into DOM
    this.domRoot.insertAdjacentElement('afterbegin', this.rootComp.dom);
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

    // this.rootComp.renderToHtmlAndDomify();

    for (let idComp in this.listObjIdRenderingScheduled) {
      let comp = this.listObjIdRenderingScheduled[idComp];

      let dataFromParentPrev = typeof comp.dataFromParentAsStringPrev !== 'undefined' ?
        JSON.parse(comp.dataFromParentAsStringPrev) :
        undefined;

      comp.renderToHtmlAndDomify(dataFromParentPrev);
      delete this.listObjIdRenderingScheduled[idComp];
    }

    this.isRenderingDue = false;
  };
}

export * from './Component';
export default GameGUI;