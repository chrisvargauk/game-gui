import Component from "./Component";
import gameGUIRouter from './Router';

export class Rout extends Component {
  afterInstantiation ( path ) {
    gameGUIRouter.subToHashChange( path, pathListSub => {
      this.setState({
        idChange: this.uid(),
      });
    });

    this.includeComp = this.includeComp.bind( this );
  }

  includeComp( attrib ) {
    return this.include(this.config, attrib);
  }

  render( path ) {
    return gameGUIRouter.runIfPathMatch( path, this.includeComp );
  }
}