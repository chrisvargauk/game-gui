import Component from "./Component";

describe('Component', () => {
  class ComponentTest extends Component {
    constructor( option, config ) {
      super(  option, config  );
    }
  }

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

    it('Should have rest of the default props set correctly', () => {
      const componentTest = new ComponentTest();
      componentTest.id = 'static-id-for-test-sake';
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

  describe('createDomElement', () => {
    const componentTest = new ComponentTest();
    const domElement = componentTest.createDomElement( 'fooBar', 'bar' );

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
});