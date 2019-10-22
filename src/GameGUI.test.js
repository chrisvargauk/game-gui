import GameGUI from './GameGUI';

describe('Game GUI', () => {
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
});