import GameGUI from './GameGUI';

describe('Game GUI', () => {
  const createMockGameGuiInstance = function () {
    const gameGUIMock = new GameGUI();
    global.setInterval = jest.fn();
    gameGUIMock.init();

    return gameGUIMock;
  };

  describe('Constructor', () => {
    // Make a copy to overwrite methods that we are not interested testing for now
    class GameGUICopy extends GameGUI {
      constructor(RootComp, selectorGuiRoot, option) {
        super(RootComp, selectorGuiRoot, option);
      }
    }

    let gameGui;

    beforeAll(() => {
      GameGUICopy.prototype.init =        jest.fn();
      GameGUICopy.prototype.regRootComp = jest.fn();
      GameGUICopy.prototype.render =      jest.fn();
      const RootCompMock = {};
      gameGui = new GameGUICopy( RootCompMock, '#ui-rout', {});
    });

    it('Should instantiate Game GUI', () => {
      expect(gameGui.init).toHaveBeenCalled();
    });

    it('Should register Root Comp', () => {
      expect(gameGui.regRootComp).toHaveBeenCalled();
    });

    it('Should start rendering immediately, in the same event loop.', () => {
      expect(gameGui.render).toHaveBeenCalled();
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
      const RootCompMock = {};
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

    const RootCompMock = {};
    gameGui = new GameGUICopy( RootCompMock, '#ui-rout', option);

    expect(global.interval.setInterval).toHaveBeenCalled();
    expect(global.setInterval).toHaveBeenCalledTimes(0);
    expect(gameGui.tokenUiRender).toBe('fakeToken');

    jest.restoreAllMocks();
    global.interval = undefined;
  });

  describe('regRootComp', () => {
    it('Should throw if Root DOM Element doesn\'t exist', () => {
      global.document.querySelector = () => null;
      const RootCompMock = {};

      let errorMsg = false;
      try {
        GameGUI.prototype.regRootComp.call(null, RootCompMock, '#ui-rout-fake');
      } catch( err ) {
        errorMsg = err.message;
      }

      expect(typeof errorMsg).toBe('string');

      jest.restoreAllMocks();
    });

    // it('Should register DOM Root', () => {
    //
    // });

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
      const gameGUIMock = {
        scheduleRendering: jest.fn(),
        indexComp: jest.fn(),
      };
      class RootCompMock {}
      GameGUI.prototype.regRootComp.call(gameGUIMock, RootCompMock, '#ui-rout');

      expect(gameGUIMock.rootComp instanceof RootCompMock).toBe(true);
    });

    it('Should hook up list of Game GUI method onto new Root Comp instance.', () => {
      document.querySelector = jest.fn(() => ({
        insertAdjacentElement: jest.fn(),
      }));
      const gameGUIMock = {
        scheduleRendering: jest.fn(() => 'scheduleRendering'),
        indexComp: jest.fn(() => 'indexComp'),
      };
      class RootCompMock {}
      GameGUI.prototype.regRootComp.call(gameGUIMock, RootCompMock, '#ui-rout');

      expect(gameGUIMock.rootComp.scheduleRendering()).toBe('scheduleRendering');
      expect(gameGUIMock.rootComp.indexComp()).toBe('indexComp');
    });

    it('Should index Root Comp like all the other Comps', () => {
      document.querySelector = jest.fn(() => ({
        insertAdjacentElement: jest.fn(),
      }));
      const gameGUIMock = {
        listObjTypeComp:    {},
        listObjIdComp:      {},
        scheduleRendering:  jest.fn(),
        indexComp:          GameGUI.prototype.indexComp,
      };
      class RootCompMock {
        constructor() {
          this.type = 'typeFake';
          this.id   = 'idFake';
        }
      }
      GameGUI.prototype.regRootComp.call(gameGUIMock, RootCompMock, '#ui-rout');

      expect( gameGUIMock.listObjTypeComp.typeFake instanceof Array).toBe( true );
      expect( gameGUIMock.listObjTypeComp.typeFake[0] instanceof RootCompMock ).toBe( true );
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

      GameGUI.prototype.onRender.call( gameGUIMock, renderEvtHandlerExtA );
      GameGUI.prototype.onRender.call( gameGUIMock, renderEvtHandlerExtB );

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
});