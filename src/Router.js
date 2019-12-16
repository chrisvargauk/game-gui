// todo: make ID as optional specification for routs, otherweise they r useless ..maybe thats okay

export class Router {
  constructor() {
    this.listRoutParsedCurrent  = [];
    this.listSub                = [];
    this.listObjPathListSub     = {}; // note: this is for debugging only

    window.addEventListener("hashchange", this.handlerHashChange.bind( this ), false);
    this.handlerHashChange();
  }

  getHash() {
    // Filter off "#"
    // Note: no str.replace(..) cos its slow
    const hashRawParts = location.hash.split('#');

    if ( 2 < hashRawParts.length ) {
      throw 'Only one "#" is allowed in the URL.';
    }

    return hashRawParts.join('');
  }

  getListRout() {
    const hash = this.getHash();

    // Single Rout in hash
    if (hash.indexOf('@') === -1 ) {
      return [hash];
    } else {
      return hash.split('@')
                 .filter( rout => rout !== '');
    }
  }

  processRout( rout ) {
    let id,
        routRemaining;
    if ( rout.indexOf(':') !== -1 ) {
      const routListPartById = rout.split(':');
      id = routListPartById[ 0 ];
      routRemaining = routListPartById[ 1 ];
    } else {
      routRemaining = rout;
    }

    let listObjAttribute,
        path;
    if ( routRemaining.indexOf('?') !== -1 ) {
      const listPartByQuestionmark = routRemaining.split('?');
      const strListAttribute  = listPartByQuestionmark[1];
      const listAttributeStr  = strListAttribute.split('&');
      path                    = listPartByQuestionmark[0];

      listObjAttribute = {};
      listAttributeStr.forEach(attributeStr => {
        if ( attributeStr.indexOf('=') !== -1 ) {
          const listPartByEqualSign = attributeStr.split('=');
          listObjAttribute[ listPartByEqualSign[0] ] = listPartByEqualSign[1];
        } else {
          listObjAttribute[attributeStr] = true;
        }
      });

    } else {
      path = routRemaining;
    }

    return {
      id,
      listObjAttribute,
      path,
    }
  }

  handlerHashChange () {
    const listRoutStr = this.getListRout();
    this.listRoutParsedCurrent = listRoutStr.map(rout => this.processRout(rout));

    this.fireAllSub();
    console.log('this.listRoutParsedCurrent:', this.listRoutParsedCurrent);
  }

  subToHashChange ( pathToMatch, fn ) {
    this.listSub.push( fn );
    this.subToPath ( pathToMatch, fn ); // note: this is for debugging only
  }

  subToPath ( pathToMatch, fn ) {
    const listSub = this.listObjPathListSub[ pathToMatch ] = this.listObjPathListSub[ pathToMatch ] || [];
    listSub.push( fn );
  }

  runIfPathMatch ( pathToMatch, fn ) {
    for ( let indexListRout=0; indexListRout<this.listRoutParsedCurrent.length; indexListRout++ ) {
      const routParsedCurrent = this.listRoutParsedCurrent[ indexListRout ];

      if ( routParsedCurrent.path.indexOf(pathToMatch) === 0 ) {
        return fn( routParsedCurrent.listObjAttribute );
      }
    }

    return '';
  }

  fireAllSub () {
    for (let indexListSub = 0; indexListSub < this.listSub.length; indexListSub++) {
      const sub = this.listSub[ indexListSub ];
      sub();
    }
  }

  // todo: implement fnToCallIfDoesntMatch
  rout ( pathToMatch, fnToCallIfMatch ) {
    this.subToHashChange( pathToMatch, () => {
      this.runIfPathMatch( pathToMatch, fnToCallIfMatch );
    });
  }
}

export * from './Rout';
export const router = new Router();
export default router;