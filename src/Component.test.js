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
    const componentTest = new ComponentTest(undefined, {id: 'bar'});
    const domElement = componentTest.createDomRepresentation();

    it('Should return an HTML Element', () => {
      expect( domElement instanceof HTMLElement ).toBe( true );
    });

    it('Should set the Comps type as Snake Cased class name on returned HTML Element.', () => {
      expect( domElement.classList.contains('component-test') ).toBe( true );
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
        expect( Object.keys(compParent.listObjCompChildByType).length ).toBe( 0 );

        mockGameGui.render();

        expect( compParent.listObjCompChildByType[CompChild.prototype.constructor.name] !== 'undefined' ).toBe( true );
      });

      it('Should NOT create new instance of Comp passed in if it has already been created before.', () => {
        document.body.innerHTML = '<div id="fake-root"></div>';
        const mockGameGui = createMockGameGuiInstance();

        mockGameGui.regRootComp(CompParent, '#fake-root');
        const compParent = mockGameGui.rootComp;
        expect( typeof compParent.listObjCompChildByType[CompChild.prototype.constructor.name] === 'undefined' ).toBe( true );

        // Render Child Comp the very first time and check whether there is only one created
        mockGameGui.render();
        expect( Object.keys(compParent.listObjCompChildByType[CompChild.prototype.constructor.name]).length ).toBe( 1 );

        // Schedule Child Comp rendering the second time then check whether there is another instance created
        compParent.scheduleRendering( compParent.listObjCompChildByType[CompChild.prototype.constructor.name]['id-child-comp'] );
        mockGameGui.render();
        expect( Object.keys(compParent.listObjCompChildByType[CompChild.prototype.constructor.name]).length ).toBe( 1 );
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

      it('Shouldn\'t update the DOM if rendered HTML is the same as the HTML on record (prev render)', () => {
        const comp = new Component();
        comp.html = 'foo';
        comp.render = () => ('foo');
        comp.dom.innerHTML = 'original';
        comp.isRenderBecauseDataPassedInChanged = () => true;
        comp.isStateUpdated                     =       true;

        comp.renderToHtmlAndDomify();

        expect( comp.dom.innerHTML ).toBe('original');
      });

      it('Should update the HTML On Record and Comps DOM if the newly rendered HTML is different from the on on record.', () => {
        const comp = new Component();
        comp.html = 'foo';
        comp.render = () => ('bar');
        comp.dom.innerHTML = 'original';
        comp.isRenderBecauseDataPassedInChanged = () => true;
        comp.isStateUpdated                     =       true;

        comp.renderToHtmlAndDomify();

        expect( comp.html ).toBe('bar');
        expect( comp.dom.innerHTML ).toBe('bar');
      });
    });

    describe('Should run "afterRender" Life Cycle Methods if defined on Comp Instance', () => {
      const comp = new Component();
      comp.html = 'foo';
      comp.render = () => ('bar');
      comp.afterRender = jest.fn();
      comp.isRenderBecauseDataPassedInChanged = () => true;

      comp.renderToHtmlAndDomify();

      expect( comp.afterRender ).toHaveBeenCalled();
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

  describe('doBind', () => {
    describe('Click Evt Handler', () => {
      it('Should link up handler method, defined by "click" attribute as string. e.g. <div ui-click="myClickHandler">...</div>', () => {
        class ClickTestComp extends Component {
          render() {
            return `<div ui-click="handlerClick">click me</div>`;
          }
        }

        const clickTestComp = new ClickTestComp();
        clickTestComp.handlerClick = jest.fn();
        clickTestComp.renderToHtmlAndDomify();

        const event = new Event("click");
        clickTestComp.dom.querySelector('div[ui-click]').dispatchEvent( event );

        expect( clickTestComp.handlerClick ).toHaveBeenCalledTimes(1);
      });
    });

    it('Should give a warning if handler method defined by ui-click attribute is not defined on the Comp.', () => {
      class ClickTestComp extends Component {
        render() {
          return `<div ui-click="handlerClick">click me</div>`;
        }
      }
      console.warn = jest.fn();

      const clickTestComp = new ClickTestComp();
      clickTestComp.handlerClick = undefined; // no need to defined undefined, just being explicit for readability sake
      clickTestComp.renderToHtmlAndDomify();

      const event = new Event("click");
      clickTestComp.dom.querySelector('div[ui-click]').dispatchEvent( event );

      expect( console.warn ).toHaveBeenCalledWith(`Game GUI: click handler called "handlerClick" can't be found on the Component (type === '${clickTestComp.type}', id: ${clickTestComp.id}).`);
    });
  });

  describe('replaceCompPlaceholderAll', () => {
    it('Should replace Comp Placeholder HTML Element with related Comp DOM.', () => {
      // Note: we already have integration test, so this test is more specific to implementation
      const compParent = new Component();
      compParent.html = 'foo';

      const compChildA = new Component();
      compChildA.html = 'child-comp-A-content-html';
      compChildA.dom.innerHTML = 'child-comp-A-content';

      const compChildB = new Component();
      compChildB.html = 'child-comp-B-content-html';
      compChildB.dom.innerHTML = 'child-comp-B-content';


      compParent.listObjCompChildByType = {
        Component: {
          '0': compChildA,
          '1': compChildB
        }
      };
      const placeholderChildCompA = `<div class="comp-placeholder" type="${compChildA.type}" ctr-child="0">placeholder text</div>`;
      const placeholderChildCompB = `<div class="comp-placeholder" type="${compChildB.type}" ctr-child="0">placeholder text</div>`;
      compParent.render = () => (`...${placeholderChildCompA}...`);
      compParent.dom.innerHTML = 'original';
      compParent.isRenderBecauseDataPassedInChanged = () => true;

      compParent.renderToHtmlAndDomify();

      const compChildADOM = `<div class="component" id="${compChildA.id}">${compChildA.dom.innerHTML}</div>`;
      expect( compParent.dom.innerHTML ).toBe(`...${compChildADOM}...`);
    });

    describe('Should replace Comp Placeholder HTML Element with related Comp DOM even, if the Parent/Wrapper Comp logic renders different Place Holder HTML Elements based on external factors.', () => {
      describe('Render Parent Comp two times in a row, with different subset of cached Child Comps', () => {
        describe('Use ctrChild, not ID from Config passed in to Child Comp at Include', () => {
          // Note: we already have integration test, so this test is more specific to implementation
          class SomeType extends  Component {}

          const compParent = new SomeType();
          compParent.html = 'foo';

          const compChildA = new SomeType();
          compChildA.html = 'child-comp-A-content-html';
          compChildA.dom.innerHTML = 'child-comp-A-content';

          const compChildB = new SomeType();
          compChildB.html = 'child-comp-B-content-html';
          compChildB.dom.innerHTML = 'child-comp-B-content';

          const compChildC = new SomeType();
          compChildC.html = 'child-comp-C-content-html';
          compChildC.dom.innerHTML = 'child-comp-C-content';


          compParent.listObjCompChildByType = {
            SomeType: {
              '0': compChildA,
              '1': compChildB,
              '2': compChildC,
            }
          };
          const placeholderChildCompA = `<div class="comp-placeholder" type="${compChildA.type}" ctr-child="0">placeholder text</div>`;
          const placeholderChildCompB = `<div class="comp-placeholder" type="${compChildB.type}" ctr-child="1">placeholder text</div>`;
          const placeholderChildCompC = `<div class="comp-placeholder" type="${compChildC.type}" ctr-child="2">placeholder text</div>`;

          const pickRenderCase = ( renderCase ) => {
            if( renderCase === 'AB' ) {
              return `${placeholderChildCompA}-${placeholderChildCompB}`;

            } else if( renderCase === 'AC' ) {
              return `${placeholderChildCompA}-${placeholderChildCompC}`;

            }
          };

          it('Render Child Comp A then Child Comp B cached version.', () => {
            compParent.render = () => (`...${pickRenderCase('AB')}...`);
            compParent.dom.innerHTML = 'original';
            compParent.isRenderBecauseDataPassedInChanged = () => true;

            compParent.renderToHtmlAndDomify();

            let compChildBoth  = `<div class="${compChildA.classNameInHtml}" id="${compChildA.id}">${compChildA.dom.innerHTML}</div>`;
                compChildBoth += `-`;
                compChildBoth += `<div class="${compChildB.classNameInHtml}" id="${compChildB.id}">${compChildB.dom.innerHTML}</div>`;
            expect( compParent.dom.innerHTML ).toBe(`...${compChildBoth}...`);
          });

          it('Render Child Comp A then Child Comp C cached version', () => {
            compParent.render = () => (`...${pickRenderCase('AC')}...`);
            compParent.dom.innerHTML = 'original';
            compParent.isRenderBecauseDataPassedInChanged = () => true;

            compParent.renderToHtmlAndDomify();

            let compChildBoth  = `<div class="${compChildA.classNameInHtml}" id="${compChildA.id}">${compChildA.dom.innerHTML}</div>`;
                compChildBoth += `-`;
                compChildBoth += `<div class="${compChildC.classNameInHtml}" id="${compChildC.id}">${compChildC.dom.innerHTML}</div>`;
            expect( compParent.dom.innerHTML ).toBe(`...${compChildBoth}...`);
          });
        });

        describe('Use ID from Config passed in to Child Comp at Include, not ctrChild', () => {
          // Note: we already have integration test, so this test is more specific to implementation
          class SomeType extends  Component {}

          const compParent = new SomeType();
          compParent.html = 'foo';

          const compChildA = new SomeType();
          compChildA.html = 'child-comp-A-content-html';
          compChildA.dom.innerHTML = 'child-comp-A-content';

          const compChildB = new SomeType();
          compChildB.html = 'child-comp-B-content-html';
          compChildB.dom.innerHTML = 'child-comp-B-content';

          const compChildC = new SomeType();
          compChildC.html = 'child-comp-C-content-html';
          compChildC.dom.innerHTML = 'child-comp-C-content';


          compParent.listObjCompChildByType = {
            SomeType: {
              'id-a': compChildA,
              'id-b': compChildB,
              'id-c': compChildC,
            }
          };
          const placeholderChildCompA = `<div class="comp-placeholder" type="${compChildA.type}" ctr-child="0" id-from-config="id-a">placeholder text</div>`;
          const placeholderChildCompB = `<div class="comp-placeholder" type="${compChildB.type}" ctr-child="1" id-from-config="id-b">placeholder text</div>`;
          const placeholderChildCompC = `<div class="comp-placeholder" type="${compChildC.type}" ctr-child="2" id-from-config="id-c">placeholder text</div>`;

          const pickRenderCase = ( renderCase ) => {
            if( renderCase === 'AB' ) {
              return `${placeholderChildCompA}-${placeholderChildCompB}`;

            } else if( renderCase === 'AC' ) {
              return `${placeholderChildCompA}-${placeholderChildCompC}`;

            }
          };

          it('Render Child Comp A then Child Comp B cached version.', () => {
            compParent.render = () => (`...${pickRenderCase('AB')}...`);
            compParent.dom.innerHTML = 'original';
            compParent.isRenderBecauseDataPassedInChanged = () => true;

            compParent.renderToHtmlAndDomify();

            let compChildBoth  = `<div class="${compChildA.classNameInHtml}" id="${compChildA.id}">${compChildA.dom.innerHTML}</div>`;
                compChildBoth += `-`;
                compChildBoth += `<div class="${compChildB.classNameInHtml}" id="${compChildB.id}">${compChildB.dom.innerHTML}</div>`;
            expect( compParent.dom.innerHTML ).toBe(`...${compChildBoth}...`);
          });

          it('Render Child Comp A then Child Comp C cached version', () => {
            compParent.render = () => (`...${pickRenderCase('AC')}...`);
            compParent.dom.innerHTML = 'original';
            compParent.isRenderBecauseDataPassedInChanged = () => true;

            compParent.renderToHtmlAndDomify();

            let compChildBoth  = `<div class="${compChildA.classNameInHtml}" id="${compChildA.id}">${compChildA.dom.innerHTML}</div>`;
                compChildBoth += `-`;
                compChildBoth += `<div class="${compChildC.classNameInHtml}" id="${compChildC.id}">${compChildC.dom.innerHTML}</div>`;
            expect( compParent.dom.innerHTML ).toBe(`...${compChildBoth}...`);
          });
        });

        describe('Use a mixture of ID from Config passed in to Child Comp at Include, and ctrChild', () => {
          // Note: we already have integration test, so this test is more specific to implementation
          class SomeType extends  Component {}

          const compParent = new SomeType();
          compParent.html = 'foo';

          const compChildA = new SomeType();
          compChildA.html = 'child-comp-A-content-html';
          compChildA.dom.innerHTML = 'child-comp-A-content';

          const compChildB = new SomeType();
          compChildB.html = 'child-comp-B-content-html';
          compChildB.dom.innerHTML = 'child-comp-B-content';

          const compChildC = new SomeType();
          compChildC.html = 'child-comp-C-content-html';
          compChildC.dom.innerHTML = 'child-comp-C-content';


          compParent.listObjCompChildByType = {
            SomeType: {
              'id-a': compChildA,
              '1':    compChildB,
              'id-c': compChildC,
            }
          };
          const placeholderChildCompA = `<div class="comp-placeholder" type="${compChildA.type}" ctr-child="0" id-from-config="id-a">placeholder text</div>`;
          const placeholderChildCompB = `<div class="comp-placeholder" type="${compChildB.type}" ctr-child="1"                      >placeholder text</div>`;
          const placeholderChildCompC = `<div class="comp-placeholder" type="${compChildC.type}" ctr-child="2" id-from-config="id-c">placeholder text</div>`;

          const pickRenderCase = ( renderCase ) => {
            if( renderCase === 'AB' ) {
              return `${placeholderChildCompA}-${placeholderChildCompB}`;

            } else if( renderCase === 'AC' ) {
              return `${placeholderChildCompA}-${placeholderChildCompC}`;

            }
          };

          it('Render Child Comp A then Child Comp B cached version.', () => {
            compParent.render = () => (`...${pickRenderCase('AB')}...`);
            compParent.dom.innerHTML = 'original';
            compParent.isRenderBecauseDataPassedInChanged = () => true;

            compParent.renderToHtmlAndDomify();

            let compChildBoth  = `<div class="${compChildA.classNameInHtml}" id="${compChildA.id}">${compChildA.dom.innerHTML}</div>`;
                compChildBoth += `-`;
                compChildBoth += `<div class="${compChildB.classNameInHtml}" id="${compChildB.id}">${compChildB.dom.innerHTML}</div>`;
            expect( compParent.dom.innerHTML ).toBe(`...${compChildBoth}...`);
          });

          it('Render Child Comp A then Child Comp C cached version', () => {
            compParent.render = () => (`...${pickRenderCase('AC')}...`);
            compParent.dom.innerHTML = 'original';
            compParent.isRenderBecauseDataPassedInChanged = () => true;

            compParent.renderToHtmlAndDomify();

            let compChildBoth  = `<div class="${compChildA.classNameInHtml}" id="${compChildA.id}">${compChildA.dom.innerHTML}</div>`;
                compChildBoth += `-`;
                compChildBoth += `<div class="${compChildC.classNameInHtml}" id="${compChildC.id}">${compChildC.dom.innerHTML}</div>`;
            expect( compParent.dom.innerHTML ).toBe(`...${compChildBoth}...`);
          });
        });

        it('Throw a waring if Component cant be found in cache when it should be, but doesnt stop rendering.', () => {
          // Note: we already have integration test, so this test is more specific to implementation
          class SomeType extends  Component {}

          const compParent = new SomeType();
          compParent.html = 'foo';

          const compChildA = new SomeType();
          compChildA.html = 'child-comp-A-content-html';
          compChildA.dom.innerHTML = 'child-comp-A-content';

          const compChildB = new SomeType();
          compChildB.html = 'child-comp-B-content-html';
          compChildB.dom.innerHTML = 'child-comp-B-content';


          compParent.listObjCompChildByType = {
            SomeType: {
              'id-b': compChildB,
            }
          };

          const placeholderChildCompA = `<div class="comp-placeholder" type="${compChildA.type}" ctr-child="0" id-from-config="id-a">placeholder text</div>`;
          const placeholderChildCompB = `<div class="comp-placeholder" type="${compChildB.type}" ctr-child="1" id-from-config="id-b">placeholder text</div>`;

          const pickRenderCase = ( renderCase ) => {
            if( renderCase === 'AB' ) {
              return `${placeholderChildCompA}-${placeholderChildCompB}`;

            } else if( renderCase === 'AC' ) {
              return `${placeholderChildCompA}-${placeholderChildCompC}`;

            }
          };

          compParent.render = () => (`...${pickRenderCase('AB')}...`);
          compParent.dom.innerHTML = 'original';
          compParent.isRenderBecauseDataPassedInChanged = () => true;

          console.warn = jest.fn();

          compParent.renderToHtmlAndDomify();

          let compChildBoth  = `<div class="comp-placeholder" type="${compChildA.type}" ctr-child="0" id-from-config="id-a">placeholder text</div>`;
              compChildBoth += `-`;
              compChildBoth += `<div class="${compChildB.classNameInHtml}" id="${compChildB.id}">${compChildB.dom.innerHTML}</div>`;
          expect( compParent.dom.innerHTML ).toBe(`...${compChildBoth}...`);
          expect(console.warn).toHaveBeenCalled();
        });

        describe('Should render Cached Comps with different types.', () => {
          // Note: we already have integration test, so this test is more specific to implementation
          class SomeTypeX extends  Component {}
          class SomeTypeY extends  Component {}

          const compParent = new SomeTypeX();
          compParent.html = 'foo';

          const compChildA = new SomeTypeX();
          compChildA.html = 'child-comp-A-content-html';
          compChildA.dom.innerHTML = 'child-comp-A-content';

          const compChildB = new SomeTypeX();
          compChildB.html = 'child-comp-B-content-html';
          compChildB.dom.innerHTML = 'child-comp-B-content';

          const compChildC = new SomeTypeY();
          compChildC.html = 'child-comp-C-content-html';
          compChildC.dom.innerHTML = 'child-comp-C-content';


          compParent.listObjCompChildByType = {
            SomeTypeX: {
              'id-a': compChildA,
              'id-b': compChildB,
            },
            SomeTypeY: {
              'id-c': compChildC,
            }
          };

          const placeholderChildCompA = `<div class="comp-placeholder" type="${compChildA.type}" ctr-child="0" id-from-config="id-a">placeholder text</div>`;
          const placeholderChildCompB = `<div class="comp-placeholder" type="${compChildB.type}" ctr-child="1" id-from-config="id-b">placeholder text</div>`;
          const placeholderChildCompC = `<div class="comp-placeholder" type="${compChildC.type}" ctr-child="2" id-from-config="id-c">placeholder text</div>`;

          const pickRenderCase = ( renderCase ) => {
            if( renderCase === 'AB' ) {
              return `${placeholderChildCompA}-${placeholderChildCompB}`;

            } else if( renderCase === 'AC' ) {
              return `${placeholderChildCompA}-${placeholderChildCompC}`;

            }
          };

          it('Render Child Comp A then Child Comp B cached version.', () => {
            compParent.render = () => (`...${pickRenderCase('AB')}...`);
            compParent.dom.innerHTML = 'original';
            compParent.isRenderBecauseDataPassedInChanged = () => true;

            compParent.renderToHtmlAndDomify();

            let compChildBoth  = `<div class="${compChildA.classNameInHtml}" id="${compChildA.id}">${compChildA.dom.innerHTML}</div>`;
                compChildBoth += `-`;
                compChildBoth += `<div class="${compChildB.classNameInHtml}" id="${compChildB.id}">${compChildB.dom.innerHTML}</div>`;
            expect( compParent.dom.innerHTML ).toBe(`...${compChildBoth}...`);
          });

          it('Render Child Comp A then Child Comp C cached version', () => {
            compParent.render = () => (`...${pickRenderCase('AC')}...`);
            compParent.dom.innerHTML = 'original';
            compParent.isRenderBecauseDataPassedInChanged = () => true;

            compParent.renderToHtmlAndDomify();

            let compChildBoth  = `<div class="${compChildA.classNameInHtml}" id="${compChildA.id}">${compChildA.dom.innerHTML}</div>`;
                compChildBoth += `-`;
                compChildBoth += `<div class="${compChildC.classNameInHtml}" id="${compChildC.id}">${compChildC.dom.innerHTML}</div>`;
            expect( compParent.dom.innerHTML ).toBe(`...${compChildBoth}...`);
          });
        });

        describe('Should render Cached Comps with different types. With a mixture of ID from Config passed in to Child Comp at Include, and ctrChild.', () => {
          // Note: we already have integration test, so this test is more specific to implementation
          class SomeTypeX extends  Component {}
          class SomeTypeY extends  Component {}

          const compParent = new SomeTypeX();
          compParent.html = 'foo';

          const compChildA = new SomeTypeX();
          compChildA.html = 'child-comp-A-content-html';
          compChildA.dom.innerHTML = 'child-comp-A-content';

          const compChildB = new SomeTypeX();
          compChildB.html = 'child-comp-B-content-html';
          compChildB.dom.innerHTML = 'child-comp-B-content';

          const compChildC = new SomeTypeY();
          compChildC.html = 'child-comp-C-content-html';
          compChildC.dom.innerHTML = 'child-comp-C-content';


          compParent.listObjCompChildByType = {
            SomeTypeX: {
              'id-a': compChildA,
              'id-b': compChildB,
            },
            SomeTypeY: {
              '2': compChildC,
            }
          };
          const placeholderChildCompA = `<div class="comp-placeholder" type="${compChildA.type}" ctr-child="0" id-from-config="id-a">placeholder text</div>`;
          const placeholderChildCompB = `<div class="comp-placeholder" type="${compChildB.type}" ctr-child="1" id-from-config="id-b">placeholder text</div>`;
          const placeholderChildCompC = `<div class="comp-placeholder" type="${compChildC.type}" ctr-child="2"                      >placeholder text</div>`;

          const pickRenderCase = ( renderCase ) => {
            if( renderCase === 'AB' ) {
              return `${placeholderChildCompA}-${placeholderChildCompB}`;

            } else if( renderCase === 'AC' ) {
              return `${placeholderChildCompA}-${placeholderChildCompC}`;

            }
          };

          it('Render Child Comp A then Child Comp B cached version.', () => {
            compParent.render = () => (`...${pickRenderCase('AB')}...`);
            compParent.dom.innerHTML = 'original';
            compParent.isRenderBecauseDataPassedInChanged = () => true;

            compParent.renderToHtmlAndDomify();

            let compChildBoth  = `<div class="${compChildA.classNameInHtml}" id="${compChildA.id}">${compChildA.dom.innerHTML}</div>`;
            compChildBoth += `-`;
            compChildBoth += `<div class="${compChildB.classNameInHtml}" id="${compChildB.id}">${compChildB.dom.innerHTML}</div>`;
            expect( compParent.dom.innerHTML ).toBe(`...${compChildBoth}...`);
          });

          it('Render Child Comp A then Child Comp C cached version', () => {
            compParent.render = () => (`...${pickRenderCase('AC')}...`);
            compParent.dom.innerHTML = 'original';
            compParent.isRenderBecauseDataPassedInChanged = () => true;

            compParent.renderToHtmlAndDomify();

            let compChildBoth  = `<div class="${compChildA.classNameInHtml}" id="${compChildA.id}">${compChildA.dom.innerHTML}</div>`;
            compChildBoth += `-`;
            compChildBoth += `<div class="${compChildC.classNameInHtml}" id="${compChildC.id}">${compChildC.dom.innerHTML}</div>`;
            expect( compParent.dom.innerHTML ).toBe(`...${compChildBoth}...`);
          });
        });

        describe('You are not forced to use IDs for all types of Comps, if you started using ID for some types.', () => {
          // Note: we already have integration test, so this test is more specific to implementation
          class SomeTypeX extends  Component {}
          class SomeTypeY extends  Component {}

          const compParent = new SomeTypeX();
          compParent.html = 'foo';

          const compChildA = new SomeTypeX();
          compChildA.html = 'child-comp-A-content-html';
          compChildA.dom.innerHTML = 'child-comp-A-content';

          const compChildC_a = new SomeTypeY();
          compChildC_a.html = 'child-comp-C-content-html';
          compChildC_a.dom.innerHTML = 'child-comp-C-content';

          const compChildC_b = new SomeTypeY();
          compChildC_b.html = 'child-comp-C-content-html';
          compChildC_b.dom.innerHTML = 'child-comp-C-content';


          compParent.listObjCompChildByType = {
            SomeTypeX: {
              'id-a': compChildA,
            },
            SomeTypeY: {
              '0': compChildC_a,
              '1': compChildC_b,
            }
          };

          const pickRenderCase = ( renderCase ) => {
            if( renderCase === 'AC' ) {
              const placeholderChildCompA = `<div class="comp-placeholder" type="${compChildA.type}" ctr-child="0" id-from-config="id-a">placeholder text</div>`;
              const placeholderChildCompC = `<div class="comp-placeholder" type="${compChildC_a.type}" ctr-child="0"                      >placeholder text</div>`;

              return `${placeholderChildCompA}-${placeholderChildCompC}`;

            } else if( renderCase === 'C' ) {
              const placeholderChildCompC = `<div class="comp-placeholder" type="${compChildC_b.type}" ctr-child="1"                      >placeholder text</div>`;

              return `${placeholderChildCompC}`;

            }
          };

          it('Render Child Comp A then Child Comp C cached version.', () => {
            compParent.render = () => (`...${pickRenderCase('AC')}...`);
            compParent.dom.innerHTML = 'original';
            compParent.isRenderBecauseDataPassedInChanged = () => true;

            compParent.renderToHtmlAndDomify();

            let compChildBoth  = `<div class="${compChildA.classNameInHtml}" id="${compChildA.id}">${compChildA.dom.innerHTML}</div>`;
                compChildBoth += `-`;
                compChildBoth += `<div class="${compChildC_a.classNameInHtml}" id="${compChildC_a.id}">${compChildC_a.dom.innerHTML}</div>`;
            expect( compParent.dom.innerHTML ).toBe(`...${compChildBoth}...`);
          });

          it('Render Child Comp C cached version without rendering Child Comp A first, proving that order of cached Comps doesnt matter as long as they have different type.', () => {
            compParent.render = () => (`...${pickRenderCase('C')}...`);
            compParent.dom.innerHTML = 'original';
            compParent.isRenderBecauseDataPassedInChanged = () => true;

            compParent.renderToHtmlAndDomify();

            let compChildBoth  = `<div class="${compChildC_b.classNameInHtml}" id="${compChildC_b.id}">${compChildC_b.dom.innerHTML}</div>`;
            expect( compParent.dom.innerHTML ).toBe(`...${compChildBoth}...`);
          });
        });
      });
    });
  });

  describe('setState', () => {
    const componentTest = new ComponentTest();
    componentTest.scheduleRendering = jest.fn();

    componentTest.setState({foo: 'bar'});

    it('Should update the state of Comp accordingly', () =>{
      expect( componentTest.state.foo ).toBe('bar');
    });

    it('Should schedlue the Comp to be rendered.', () =>{
      expect( componentTest.isStateUpdated ).toBe( true );
      expect( componentTest.scheduleRendering ).toHaveBeenCalledWith( componentTest );
    });
  });

  describe('getState', () => {
    const componentTest = new ComponentTest();
    componentTest.setState({foo: 'bar'});

    it('Should update the state of Comp accordingly', () =>{
      expect( componentTest.getState().foo ).toBe('bar');
    });
  });

  describe('uid', () => {
    const componentTest = new ComponentTest();

    it('Should produce a unique ID under any circumstance.', () =>{
      expect( componentTest.uid() ).not.toBe( componentTest.uid() );
    });
  });

  describe('camelCaseToSnakeCase', () => {
    const componentTest = new ComponentTest();

    it('Should produce a unique ID under any circumstance.', () =>{
      expect( componentTest.camelCaseToSnakeCase('TestComp') ).toBe( 'test-comp' );
    });
  });
});