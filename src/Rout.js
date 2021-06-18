import { Component } from "./Component.js";
import { router } from './router.js';

export class Rout extends Component {
  afterInstantiation ( path ) {
    router.subToHashChange( path, pathListSub => {
      this.setState({
        idChange: this.uid(),
      });
    });
  }

  render( path ) {
    // Return the Comp that matches the Path provided - Partial Match to the Left works.
    return router.runIfPathMatch( path, dataInHash =>
      /*
        Note: "this.config" is the "CompToRenderWhenPathTriggered".
              This is counter intuitive but simplifies the API of a Rout.

        When we include a new Rout
        ..${this.include(GameGUI.Rout, 'my/path', CompToRenderWhenPathTriggered)}..
        You can see that "CompToRenderWhenPathTriggered" becomes "this.config".
        ..${this.include(ClassComp, dataFromParent, config)}..
        ClassComp: GameGUI.Rout, dataFromParent: 'my/path', config: CompToRenderWhenPathTriggered
      */
      (this.include(this.config, dataInHash))
    );
  }
}

export default Rout;