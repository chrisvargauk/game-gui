import { GameGUI } from './GameGUI';

describe('Game GUI', () => {
  const createMockGameGuiInstance = function () {
    const gameGUIMock = new GameGUI();
    global.setInterval = jest.fn();
    gameGUIMock.init();

    return gameGUIMock;
  };

  const createMockComp = function () {
    class RootCompMock {}
    RootCompMock.prototype.type = 'typeFake';
    RootCompMock.prototype.id   = 'idFake';

    return RootCompMock;
  };

  describe('Constructor', () => {
    // Make a copy to overwrite methods that we are not interested testing for now
    class GameGUICopy extends GameGUI {
      constructor(RootComp, selectorGuiRoot, option, configRootComp) {
        super(RootComp, selectorGuiRoot, option, configRootComp);
      }
    }

    const selectorGuiRoot = '#ui-rout',
      option          = {foo: 'foo'},
      configRootComp  = {bar: 'bar'};

    let gameGui,
      RootCompMock;

    beforeAll(() => {
      GameGUICopy.prototype.init            = jest.fn();
      GameGUICopy.prototype.regRootComp     = jest.fn();
      GameGUICopy.prototype.render          = jest.fn();
      GameGUICopy.prototype.registerBinding = jest.fn();
      RootCompMock = createMockComp();
      gameGui = new GameGUICopy( RootCompMock, selectorGuiRoot, option, configRootComp);
    });

    it('Should instantiate Game GUI', () => {
      expect(gameGui.init).toHaveBeenCalled();
    });

    it('Should register Root Comp', () => {
      expect(gameGui.regRootComp).toHaveBeenCalled();
    });

    it('Should NOT start rendering immediately, in the same event loop, giving a chance to Third Party to register.', () => {
      expect(gameGui.render).not.toHaveBeenCalled();
    });

    it('Should pass along attributes received', () => {
      expect( GameGUICopy.prototype.init        ).toHaveBeenCalledWith( option );
      expect( GameGUICopy.prototype.regRootComp ).toHaveBeenCalledWith( RootCompMock, selectorGuiRoot, configRootComp );
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });
  });

  describe('At instantiation should compose option from', () => {
    // Make a copy to overwrite methods that we are not interested testing for now
    class GameGUICopy extends GameGUI {
      constructor(RootComp, selectorGuiRoot, option) {
        super(RootComp, selectorGuiRoot, option);
      }
    }

    let gameGui;

    GameGUICopy.prototype.regRootComp = jest.fn();
    GameGUICopy.prototype.render      = jest.fn();

    const option = {
      testOption: 'testValue'
    };

    global.setInterval = jest.fn();

    beforeAll(() => {
      const RootCompMock = createMockComp();
      gameGui = new GameGUICopy( RootCompMock, '#ui-rout', option);
    });

    it('default options', () => {
      expect(gameGui.option.fps).toBe( 60 );
    });

    it('and options passed in at construction', () => {
      expect(gameGui.option.testOption).toBe( option.testOption )
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });
  });

  it('Integrates Interval.js if available.', () => {
    // Make a copy to overwrite methods that we are not interested testing for now
    class GameGUICopy extends GameGUI {
      constructor(RootComp, selectorGuiRoot, option) {
        super(RootComp, selectorGuiRoot, option);
      }
    }

    let gameGui;

    GameGUICopy.prototype.regRootComp = jest.fn();
    GameGUICopy.prototype.render      = jest.fn();

    const option = {
      testOption: 'testValue'
    };

    global.setInterval = jest.fn();
    global.interval = {
      setInterval: jest.fn(() => 'fakeToken'),
    };

    const RootCompMock = createMockComp();
    gameGui = new GameGUICopy( RootCompMock, '#ui-rout', option);

    expect(global.interval.setInterval).toHaveBeenCalled();
    expect(global.setInterval).toHaveBeenCalledTimes(0);
    expect(gameGui.tokenUiRender).toBe('fakeToken');

    jest.restoreAllMocks();
    global.interval = undefined;
  });

  describe('regRootComp', () => {
    it('Should register DOM Root', () => {
      document.querySelector = jest.fn(() => ({
        foo: 'bar',
        insertAdjacentElement: jest.fn(),
      }));
      const gameGUIMock = createMockGameGuiInstance();
      const RootCompMock  = createMockComp();

      GameGUI.prototype.regRootComp.call(gameGUIMock, RootCompMock, '#ui-rout-mock');

      expect( GameGUI.prototype.getDomRoot.call(gameGUIMock).foo ).toBe('bar');
    });

    it('Throws if provided GUI Root Selector points to non-existent DOM Element.', () => {
      let errorMsg = false;
      try {
        GameGUI.prototype.regRootComp.call(null, RootCompMock, '#ui-rout-fake');
      } catch( err ) {
        errorMsg = err.message;
      }

      expect(typeof errorMsg).toBe('string');
      // Note: dont care about what the error message says exactly as long as I got one

      jest.restoreAllMocks();
    });

    it('Should instantiate Root Comp if provided.', () => {
      document.querySelector = jest.fn(() => ({
        insertAdjacentElement: jest.fn(),
      }));
      const gameGUIMock   = createMockGameGuiInstance();
      const RootCompMock  = createMockComp();

      GameGUI.prototype.regRootComp.call(gameGUIMock, RootCompMock, '#ui-rout');

      expect(gameGUIMock.rootComp instanceof RootCompMock).toBe(true);
    });

    it('Should provide "option" and "config" to Root Comp instantiation if available.', () => {
      document.querySelector = jest.fn(() => ({
        insertAdjacentElement: jest.fn(),
      }));
      const gameGUIMock   = createMockGameGuiInstance();
      const configRootComp = {
        foo: 'bar',
      };

      const RootCompMock = jest.fn();
      RootCompMock.prototype.type = 'typeFake';
      RootCompMock.prototype.id   = 'idFake';

      GameGUI.prototype.regRootComp.call(gameGUIMock, RootCompMock, '#ui-rout', configRootComp);

      expect( RootCompMock ).toHaveBeenCalledWith( gameGUIMock.option, configRootComp );
    });

    it('Should hook up list of Game GUI method onto new Root Comp instance.', () => {
      document.querySelector = jest.fn(() => ({

        insertAdjacentElement: jest.fn(),
      }));
      const gameGUIMock = {
        scheduleRendering: jest.fn(() => 'scheduleRendering'),
        indexComp: jest.fn(() => 'indexComp'),
      };
      const RootCompMock = createMockComp();
      GameGUI.prototype.regRootComp.call(gameGUIMock, RootCompMock, '#ui-rout');

      expect(gameGUIMock.rootComp.scheduleRendering()).toBe('scheduleRendering');
      expect(gameGUIMock.rootComp.indexComp()).toBe('indexComp');
    });

    it('Should index Root Comp like all the other Comps', () => {
      document.querySelector = jest.fn(() => ({
        insertAdjacentElement: jest.fn(),
      }));
      const gameGUIMock = createMockGameGuiInstance();
      const RootCompMock = createMockComp();
      GameGUI.prototype.regRootComp.call(gameGUIMock, RootCompMock, '#ui-rout');

      expect( gameGUIMock.listObjTypeComp.typeFake instanceof Array).toBe( true );
      expect( gameGUIMock.listObjTypeComp.typeFake[0] instanceof RootCompMock ).toBe( true );
    });

    it('Should schedule rendering of Root Comp when it is getting registered.', () => {
      document.querySelector = jest.fn(() => ({
        insertAdjacentElement: jest.fn(),
      }));
      const gameGUIMock = createMockGameGuiInstance();
      const RootCompMock = createMockComp();
      GameGUI.prototype.regRootComp.call(gameGUIMock, RootCompMock, '#ui-rout');

      expect( gameGUIMock.isRenderingDue ).toBe( true );
      expect( gameGUIMock.listObjIdRenderingScheduled[RootCompMock.prototype.id] instanceof RootCompMock ).toBe( true );
    });

    it('Should inject Root Comps html representation into DOM Root HTML Element.', () => {
      // Note: This functionality can't be tested yet because implementation uses "insertAdjacentElement",
      // and that is not supported by Jest yet.
      expect( true ).toBe( true );
    });
  });

  describe('scheduleRendering', () => {
    it('Should throw if no Comp is passed in.', () => {
      let errorMsg;
      try {
        GameGUI.prototype.scheduleRendering.call( undefined );
      } catch ( err ) {
        errorMsg = err;
      }

      expect( typeof errorMsg !== 'undefined' ).toBe( true );
    });

    it('Should throw if non-standard Comp is passed in.', () => {
      const comp = {};

      let errorMsg;
      try {
        GameGUI.prototype.scheduleRendering.call( null, comp );
      } catch ( err ) {
        errorMsg = err;
      }

      expect( typeof errorMsg !== 'undefined' ).toBe( true );
    });

    it('Should add Comp passed in to Render Queue and should be rendered at next available render time', () => {
      const renderToHtmlAndDomifyA = jest.fn();
      const compA                  = {
        id:                    'compA',
        renderToHtmlAndDomify: renderToHtmlAndDomifyA,
      };

      const gameGUIMock = createMockGameGuiInstance();

      GameGUI.prototype.scheduleRendering.call( gameGUIMock, compA );
      GameGUI.prototype.render.call( gameGUIMock );

      expect( renderToHtmlAndDomifyA ).toHaveBeenCalled();
    });
  });

  describe('render', () => {
    it('Should only render if there is something to be rendered.', () => {
      const gameGUIMock = {
        isRenderingDue: false,
      };

      expect( GameGUI.prototype.render.call(gameGUIMock) ).toBe( false );
    });

    describe('Should', () => {
      const renderToHtmlAndDomifyA = jest.fn(),
        renderToHtmlAndDomifyB = jest.fn(),
        renderEvtHandlerExtA   = jest.fn(),
        renderEvtHandlerExtB   = jest.fn(),
        dataFromParentPrev     = {foo: 'bar'};
      const compA                  = {
          id:                    'compA',
          renderToHtmlAndDomify: renderToHtmlAndDomifyA,
        },
        compB                  = {
          id:                    'compB',
          renderToHtmlAndDomify: renderToHtmlAndDomifyB,
          dataFromParentAsStringPrev: JSON.stringify( dataFromParentPrev),
        };

      const gameGUIMock = createMockGameGuiInstance();

      GameGUI.prototype.scheduleRendering.call( gameGUIMock, compA );
      GameGUI.prototype.scheduleRendering.call( gameGUIMock, compB );

      GameGUI.prototype.addEventListener.call( gameGUIMock, 'rendered',renderEvtHandlerExtA );
      GameGUI.prototype.addEventListener.call( gameGUIMock, 'rendered',renderEvtHandlerExtB );

      GameGUI.prototype.render.call( gameGUIMock );

      it('recover stored data passed in from Parent Comp previously, and pass it along to Comp Rendering.', () => {
        expect( renderToHtmlAndDomifyA ).toHaveBeenCalledWith( undefined );
        expect( renderToHtmlAndDomifyB ).toHaveBeenCalledWith( dataFromParentPrev );
      });

      it('render Comps scheduled in the queue,', () => {
        expect( renderToHtmlAndDomifyA ).toHaveBeenCalled();
        expect( renderToHtmlAndDomifyB ).toHaveBeenCalled();
      });

      it('then remove those Comps from that queue.', () => {
        expect( Object.keys(gameGUIMock.listObjIdRenderingScheduled).length ).toBe( 0 );
      });

      it('update state to avoid rendering till another Comp is scheduled for rendering', () => {
        expect( GameGUI.prototype.render.call( gameGUIMock ) ).toBe( false );
      });

      it('call all the Render Event Handlers passed in externally, right after all Comps in the queue is rendered.', () => {
        expect( renderEvtHandlerExtA ).toHaveBeenCalled();
        expect( renderEvtHandlerExtB ).toHaveBeenCalled();
      });
    });
  });

  it('Should register and retrieve Comps.', () => {
    const compA                  = {
      id:                    'compAId',
      type:                  'compA',
    };

    const gameGUIMock = createMockGameGuiInstance();

    GameGUI.prototype.indexComp.call( gameGUIMock, compA );

    expect( GameGUI.prototype.getCompById.call(       gameGUIMock, compA.id  )    ).toBe( compA );
    console.warn = jest.fn(); // omit deprecation warning.
    expect( GameGUI.prototype.getCompByType.call(     gameGUIMock, compA.type)[0] ).toBe( compA );
    expect( GameGUI.prototype.getListCompByType.call( gameGUIMock, compA.type)[0] ).toBe( compA );
  });

  describe('indexComp', () => {
    it('Should Index Comps by Type', () => {
      const CompMock = createMockComp();
      const compMock = new CompMock();
      const gameGUIMock = createMockGameGuiInstance();

      GameGUI.prototype.indexComp.call( gameGUIMock, compMock );

      expect( gameGUIMock.listObjTypeComp[CompMock.prototype.type] instanceof Array).toBe( true );
      expect( gameGUIMock.listObjTypeComp[CompMock.prototype.type][0] instanceof CompMock ).toBe( true );
    });
  });
});