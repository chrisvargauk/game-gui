import Component from "./Component";
import gameGUIRouter from './Router';

export class Rout extends Component {
  afterInstantiation ( path ) {
    gameGUIRouter.subToHashChange( path, pathListSub => {
      this.setState({
        idChange: this.uid(),
      });
    });
  }

  render( path ) {
    return gameGUIRouter.runIfPathMatch( path, (attrib) =>
      this.include(this.config, attrib)
    );
  }
}