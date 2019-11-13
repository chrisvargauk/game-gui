import GameGUI from './GameGUI';
import Component from "./Component";
import { insertAdjacentElement } from './polyfill/insertAdjesentElement';

describe('Component', () => {
  const createMockGameGuiInstance = function ( option ) {
    const gameGUIMock = new GameGUI();
    global.setInterval = jest.fn();
    gameGUIMock.init( option );

    return gameGUIMock;
  };

  class ComponentTest extends Component {}

  beforeAll(() => {
    HTMLElement.prototype.insertAdjacentElement = HTMLElement.prototype.insertAdjacentElement || insertAdjacentElement;
  });

  describe('constructor', () => {

    it('Takes "option" and "config" objects as arguments at instantiation.', () => {
      const componentTest = new ComponentTest({foo: 'foo'}, {bar: 'bar'});
      expect( componentTest.option.foo ).toBe('foo');
      expect( componentTest.config.bar ).toBe('bar');
    });

    it('Arguments "option" and "config" are optional.', () => {
      let componentTest,
          error = false;
      try {
        componentTest = new ComponentTest();
      } catch ( err ) {
        error = err;
      }

      expect( error ).toBe( false );
      expect( JSON.stringify(componentTest.option) ).toBe('{}');
      expect( JSON.stringify(componentTest.config) ).toBe('{}');
    });

    describe('Comp ID is', () => {
      it('Either defined in the config (config.id),', () => {
        const componentTest = new ComponentTest(undefined, {id: 'foo'});
        expect( componentTest.id ).toBe( 'foo' );
      });

      it('or random generated if not specified in the config.', () => {
        const componentTestA = new ComponentTest();
        const componentTestB = new ComponentTest();
        expect( typeof componentTestA.id ).toBe( 'string' );
        expect( componentTestA.id !== componentTestB.id).toBe( true );
      });
    });

    it('Should have "type" prop. which is the name of the class', () => {
      const componentTest = new ComponentTest();
      expect( componentTest.type ).toBe( 'ComponentTest' );
      // note: detailed testing of "type" will be done when we test the method that produces it,
      //       here we just wanna know that this prop is present.
    });

    it('Should have "dom" prop., the DOM Element that will contain all the rendered elements of the Comp.', () => {
      const componentTest = new ComponentTest();
      expect( componentTest.dom instanceof HTMLElement ).toBe( true );
      // note: detailed testing of "dom" will be done when we test it factory method,
      //       here we just wanna know that this prop is present .
    });

    it('Should have the rest of the default props set correctly', () => {
      const option = {},
            config = {
              id: 'static-id-for-test-sake'
            };
      const componentTest = new ComponentTest( option, config );
      expect( componentTest ).toMatchSnapshot();
    });

  });

  describe('getTypeOfComp', () => {
    it('Should return "type", which is the class name.', () => {
      const componentTest = new ComponentTest();
      expect( componentTest.type ).toBe( 'ComponentTest' );
    });

    it('Should take artifacts created by transpiler into account when "type" is returned.', () => {
      class ComponentTestCustom_ImportedCompName extends Component {};
      // Note: we mimic what the transpiler does to class names.

      const componentTestCustom = new ComponentTestCustom_ImportedCompName();

      expect( componentTestCustom.type ).toBe( 'ImportedCompName' );
    });
  });

  describe('createDomRepresentation', () => {
    const componentTest = new ComponentTest();
    const domElement = componentTest.createDomRepresentation( 'fooBar', 'bar' );

    it('Should return an HTML Element', () => {
      expect( domElement instanceof HTMLElement ).toBe( true );
    });

    it('Should set the Comps type as Snake Cased class name on returned HTML Element.', () => {
      expect( domElement.classList.contains('foo-bar') ).toBe( true );
    });

    it('Should set the Comps ID as "id" attribute on returned HTML Element.', () => {
      expect( domElement.getAttribute('id') ).toBe( 'bar' );
    });
  });

  describe('include', () => {
    describe('If Smart Comp (Class)', () => {
      class CompChild extends Component {}
      class CompParent extends Component {
        render() {
          return `...${this.include( CompChild, undefined, {id: 'id-child-comp'} )}...`;
        }
      }

      it('Should create new instance of Comp passed in if it hasen\'t been created yet.', () => {
        document.body.innerHTML = '<div id="fake-root"></div>';
        const mockGameGui = createMockGameGuiInstance();

        mockGameGui.regRootComp(CompParent, '#fake-root');
        const compParent = mockGameGui.rootComp;
        expect( Object.keys(compParent.listObjCompChild).length ).toBe( 0 );

        mockGameGui.render();

        expect( compParent.listObjCompChild[0].type ).toBe( CompChild.prototype.constructor.name );
      });

      it('Should NOT create new instance of Comp passed in if it has already been created before.', () => {
        document.body.innerHTML = '<div id="fake-root"></div>';
        const mockGameGui = createMockGameGuiInstance();

        mockGameGui.regRootComp(CompParent, '#fake-root');
        const compParent = mockGameGui.rootComp;
        expect( Object.keys(compParent.listObjCompChild).length ).toBe( 0 );

        // Render Child Comp the very first time and check whether there is only one created
        mockGameGui.render();
        expect( Object.keys(compParent.listObjCompChild).length ).toBe( 1 );
        expect( compParent.listObjCompChild[0].type ).toBe( CompChild.prototype.constructor.name );

        // Schedule Child Comp rendering the second time then check whether there is another instance creted
        compParent.scheduleRendering( compParent.listObjCompChild[0] );
        mockGameGui.render();
        expect( Object.keys(compParent.listObjCompChild).length ).toBe( 1 );
      });

      it('Should inject html representation of the rendered Comp passed in', () => {
        document.body.innerHTML = '<div id="fake-root"></div>';
        const mockGameGui = createMockGameGuiInstance();

        mockGameGui.regRootComp(CompParent, '#fake-root', {id: 'id-root-comp'});

        mockGameGui.render();

        const htmlCompChild = '<div class="comp-child" id="id-child-comp"><span>Placeholder text for Comp CompChild</span></div>';
        const htmlCompParent = `<div class="comp-parent" id="id-root-comp">...${htmlCompChild}...</div>`;
        const htmlBody = `<div id="fake-root">${htmlCompParent}</div>`;

        expect( document.body.innerHTML ).toBe( htmlBody );
      });

      it('Should get the included Comp indexed.', () => {
        document.body.innerHTML = '<div id="fake-root"></div>';
        const mockGameGui = createMockGameGuiInstance();

        mockGameGui.regRootComp(CompParent, '#fake-root', {id: 'id-root-comp'});

        mockGameGui.render();

        const htmlCompChild = '<div class="comp-child" id="id-child-comp"><span>Placeholder text for Comp CompChild</span></div>';
        const htmlCompParent = `<div class="comp-parent" id="id-root-comp">...${htmlCompChild}...</div>`;
        const htmlBody = `<div id="fake-root">${htmlCompParent}</div>`;

        expect( mockGameGui.getCompById('id-child-comp') !== 'undefined' ).toBe( true );
      });
    });

    describe('If Dumb Comp (function)', () => {
      it('Should call the function, and return the result (html string).', () => {
        const CompChild  = () => (`<span>content comes here..</span>`);
        class CompParent extends Component {
          render() {
            return `...${this.include( CompChild, undefined, {id: 'id-child-comp'} )}...`;
          }
        }

        document.body.innerHTML = '<div id="fake-root"></div>';
        const mockGameGui = createMockGameGuiInstance();

        mockGameGui.regRootComp(CompParent, '#fake-root', {id: 'id-root-comp'});

        mockGameGui.render();

        const htmlCompChild = CompChild();
        const htmlCompParent = `<div class="comp-parent" id="id-root-comp">...${htmlCompChild}...</div>`;
        const htmlBody = `<div id="fake-root">${htmlCompParent}</div>`;

        expect( document.body.innerHTML ).toBe( htmlBody );
      });

      it('Should propagate Data from Parent Comp to Child Dumb Comp', () => {
        const dataFromParent = {
            foo: 'foo',
          },
          option = {
            bar: 'bar',
          };

        const CompChild  = ( dataFromParent, option ) =>
          (`<span>data from parent: ${dataFromParent.foo} ${option.bar}</span>`);
        class CompParent extends Component {
          render() {
            return `...${this.include( CompChild, dataFromParent, {id: 'id-child-comp'} )}...`;
          }
        }

        document.body.innerHTML = '<div id="fake-root"></div>';
        const mockGameGui = createMockGameGuiInstance( option );

        mockGameGui.regRootComp(CompParent, '#fake-root', {id: 'id-root-comp'});

        mockGameGui.render();

        const htmlCompChild = CompChild( dataFromParent, option );
        const htmlCompParent = `<div class="comp-parent" id="id-root-comp">...${htmlCompChild}...</div>`;
        const htmlBody = `<div id="fake-root">${htmlCompParent}</div>`;

        expect( document.body.innerHTML ).toBe( htmlBody );
      });
    });
  });

  describe('renderToHtmlAndDomify', () => {
    describe('skip rendering if', () => {
      // Optimise Rendering to HTML
      // Note: Comp HTML Representation can change one of two ways:
      //       A) Data Passed in from Parent Comp has changed
      //       B) State has changed
      //       C) HTML Representation of Comp has never been created before, therefore
      //          what ever we render will be different from current HTML Representation of the Comp.

      it('Don\'t skip if HTML representation of Comp has never been rendered yet.', () => {
        const comp = new Component();
        comp.render = jest.fn();
        comp.renderToHtmlAndDomify();
        expect( comp.render ).toHaveBeenCalled();
      });

      describe('Data Passed In From Parent Comp hasen\'t changed and the sate of the Comp hasen\'t changed either', () => {
        it('Scenario 1) Skip if, Data Passed In From Parent Comp is the Same, and Comp State is the Same', () => {
          const comp = new Component();
          comp.render = jest.fn();
          comp.html = 'foo';
          comp.isRenderBecauseDataPassedInChanged = () => false;
          comp.isStateUpdated                     =       false;
          comp.renderToHtmlAndDomify();
          expect( comp.render ).toHaveBeenCalledTimes( 0 );
        });

        it('Scenario 2) DONT Skip if, Data Passed In From Parent Comp has changed, and Comp State is the Same', () => {
          const comp = new Component();
          comp.render = jest.fn();
          comp.html = 'foo';
          comp.isRenderBecauseDataPassedInChanged = () => true;
          comp.isStateUpdated                     =       false;
          comp.renderToHtmlAndDomify();
          expect( comp.render ).toHaveBeenCalledTimes( 1 );
        });

        it('Scenario 3) DONT Skip if, Data Passed In From Parent Comp is the Same, and Comp State has changed', () => {
          const comp = new Component();
          comp.render = jest.fn();
          comp.html = 'foo';
          comp.isRenderBecauseDataPassedInChanged = () => false;
          comp.isStateUpdated                     =       true;
          comp.renderToHtmlAndDomify();
          expect( comp.render ).toHaveBeenCalledTimes( 1 );
        });

        it('Scenario 3) DONT Skip if, Data Passed In From Parent Comp has changed, and Comp State has changed', () => {
          const comp = new Component();
          comp.render = jest.fn();
          comp.html = 'foo';
          comp.isRenderBecauseDataPassedInChanged = () => true;
          comp.isStateUpdated                     =       true;
          comp.renderToHtmlAndDomify();
          expect( comp.render ).toHaveBeenCalledTimes( 1 );
        });
      });
    });
  });

  describe('isRenderBecauseDataPassedInChanged', () => {
    describe('Scenario 1) prev === undefined && passed === undefined --> DON\'T RENDER', () => {
      const comp = new Component();
      // Note: the default value of previously passed in data is set to undefined in every new Comp. See below:
      // ..comp.dataFromParentAsStringPrev = undefined;
      const dataFromParent = undefined;

      const returnedValue = comp.isRenderBecauseDataPassedInChanged ( dataFromParent );

      it('Should return FALSE', () => {
        expect( returnedValue ).toBe( false );
      });

      it('Should NOT update record of Data Passed In From Parent Comp', () => {
        expect( typeof comp.dataFromParentAsStringPrev ).toBe( 'undefined' );
      });
    });

    describe('Scenario 2) prev === undefined && passed !== undefined --> RENDER', () => {
      const comp = new Component();
      // Note: the default value of previously passed in data is set to undefined in every new Comp. See below:
      // ..comp.dataFromParentAsStringPrev = undefined;
      const dataFromParent = 'foo';

      const returnedValue = comp.isRenderBecauseDataPassedInChanged ( dataFromParent );
      it('Should return TRUE', () => {
        expect( returnedValue ).toBe( true );
      });

      it('Should update record of Data Passed In From Parent Comp', () => {
        expect( comp.dataFromParentAsStringPrev ).toBe( JSON.stringify(dataFromParent) );
      });
    });

    describe('Scenario 3) prev !== undefined && passed === undefined --> RENDER', () => {
      const comp = new Component();
      // Note: the default value of previously passed in data is set to undefined in every new Comp. See below:
      comp.dataFromParentAsStringPrev = JSON.stringify('foo');
      const dataFromParent = undefined;

      const returnedValue = comp.isRenderBecauseDataPassedInChanged ( dataFromParent );

      it('Should return TRUE', () => {
        expect( returnedValue ).toBe( true );
      });

      it('Should update record of Data Passed In From Parent Comp', () => {
        expect( typeof comp.dataFromParentAsStringPrev ).toBe( typeof dataFromParent );
      });
    });

    describe('Scenario 4) prev !== undefined && passed !== undefined --> COMPARE', () => {
      describe('Compare / same --> DON\'T RENDER', () => {
        const comp = new Component();
        // Note: the default value of previously passed in data is set to undefined in every new Comp. See below:
        comp.dataFromParentAsStringPrev = JSON.stringify('foo');
        const dataFromParent = 'foo';

        const returnedValue = comp.isRenderBecauseDataPassedInChanged ( dataFromParent );

        it('Should return FALSE', () => {
          expect( returnedValue ).toBe( false );
        });

        it('Doesn\'t matter whether it updates record of Data Passed In From Parent Comp, it will be the same', () => {
          expect( comp.dataFromParentAsStringPrev ).toBe( JSON.stringify(dataFromParent) );
        });
      });

      describe('Compare / different --> RENDER', () => {
        const comp = new Component();
        // Note: the default value of previously passed in data is set to undefined in every new Comp. See below:
        comp.dataFromParentAsStringPrev = JSON.stringify('foo');
        const dataFromParent = 'bar';

        const returnedValue = comp.isRenderBecauseDataPassedInChanged ( dataFromParent );

        it('Should return TRUE', () => {
          expect( returnedValue ).toBe( true );
        });

        it('Should update record of Data Passed In From Parent Comp', () => {
          expect( comp.dataFromParentAsStringPrev ).toBe( JSON.stringify(dataFromParent) );
        });
      });
    });
  });
});