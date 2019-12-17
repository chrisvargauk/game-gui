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

  subToHashChange ( pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch ) {
    this.listSub.push( fnToCallIfMatch );
    this.subToPath ( pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch ); // note: this is for debugging only
    this.handlerHashChange();
  }

  subToPath ( pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch ) {
    const listSub = this.listObjPathListSub[ pathToMatch ] = this.listObjPathListSub[ pathToMatch ] || [];
    listSub.push( {pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch} );
  }

  runIfPathMatch ( pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch, singleActivation ) {
    let routParsedCurrentMatching;

    // Search
    // Iterate List of Current Routs/Paths
    for ( let indexListRout=0; indexListRout<this.listRoutParsedCurrent.length; indexListRout++ ) {
      const routParsedCurrent = this.listRoutParsedCurrent[ indexListRout ];

      // If Current Routs/Paths Iter matching Path that we are searching for
      // Note: Match it only to the left, e.g.: main/setting & main/setting/audio
      if ( routParsedCurrent.path.indexOf(pathToMatch) === 0 ) {
        routParsedCurrentMatching = routParsedCurrent;
      }
    }

    // Matching
    // If there is a matching Subscriber/Rout
    if ( routParsedCurrentMatching ) {
      // If "fnToCallIfMatch" should be called once in subsequent matching Paths
      if ( singleActivation ) {
        // If Path was inactive up to now
        if ( !fnToCallIfMatch.isActive ) {
          fnToCallIfMatch.isActive = true;
          return fnToCallIfMatch( routParsedCurrentMatching.listObjAttribute );

        // If Path was inactivated by prev path
        } else {
          return '';
        }

      } else {
        return fnToCallIfMatch( routParsedCurrentMatching.listObjAttribute );
      }

    // NOT Matching
    // If there is NO matching Subscriber/Rout, and we have a Callback to call when doesnt match
    } else if ( typeof fnToCallIfDoesntMatch !== 'undefined' ) {
      // If Rout was active with prev Path
      // Note: it makes sure that "fnToCallIfDoesntMatch" is called only once
      if (fnToCallIfMatch.isActive) {
        fnToCallIfMatch.isActive = false;
        fnToCallIfDoesntMatch();
      }

      return '';

    } else {
      return '';
    }
  }

  fireAllSub () {
    for (let indexListSub = 0; indexListSub < this.listSub.length; indexListSub++) {
      const sub = this.listSub[ indexListSub ];
      sub();
    }
  }

  rout ( pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch ) {
    this.subToHashChange( pathToMatch, () => {
      this.runIfPathMatch( pathToMatch, fnToCallIfMatch, fnToCallIfDoesntMatch, true );
    }, fnToCallIfDoesntMatch );
  }
}

export * from './Rout';
export const router = new Router();
export default router;