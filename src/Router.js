// todo: Get rid of the @ symbol
// todo: Add feature to discard the rest of the url if necessary @menu:main/setting

export class Router {
  constructor() {
    this.listObjRoutParsedCurrent = {};
    this.listSub                  = [];
    this.listObjPathListSub       = {}; // note: this is for debugging only

    window.addEventListener("hashchange", this.handlerHashChange.bind( this ), false);
    this.handlerHashChange();
  }

  getHash( hashInput ) {
    // Filter off "#"
    // Note: no str.replace(..) cos its slow
    const hashUpdate = hashInput || location.hash;
    const hashRawParts = hashUpdate.split('#');

    if ( 2 < hashRawParts.length ) {
      throw 'Only one "#" is allowed in the URL.';
    }

    return hashRawParts.join('');
  }

  getListRout( hashInput ) {
    const hash = this.getHash( hashInput );

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
    const listObjRoutParsedCurrentUpdate = {};
    listRoutStr.forEach(routStr => {
      const routObj = this.processRout( routStr );
      listObjRoutParsedCurrentUpdate[ routObj.id ] = routObj;
    });

    this.listObjRoutParsedCurrent = listObjRoutParsedCurrentUpdate;

    this.fireAllSub();
    console.log('this.listObjRoutParsedCurrent:', this.listObjRoutParsedCurrent);
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
    for ( let idListRout in this.listObjRoutParsedCurrent) {
      const routParsedCurrent = this.listObjRoutParsedCurrent[ idListRout ];

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

  updateHash ( hashNew ) {
    console.log('new Hahs', hashNew);

    const listRoutStr = this.getListRout( hashNew );

    const listObjRoutParsedNew = {};
    listRoutStr.forEach(routStr => {
      const routObj = this.processRout( routStr );
      listObjRoutParsedNew[ routObj.id ] = routObj;
    });

    console.log('listObjRoutParsedNew', listObjRoutParsedNew);

    // Update Hash on record
    const listObjRoutParsedUpdate = {
      ...this.listObjRoutParsedCurrent,
      ...listObjRoutParsedNew
    };

    console.log('listObjRoutParsedUpdate', listObjRoutParsedUpdate);

    const hashUpdated = this.reconstructHash( listObjRoutParsedUpdate );
    location.hash = hashUpdated;
  }

  reconstructHash( listObjRoutParsedUpdate ) {
    let hashUpdated = '';

    // Multiple routs on record
    if ( 1 < Object.keys(listObjRoutParsedUpdate).length ) {
      for (let idObjRoutParsedCurrent in listObjRoutParsedUpdate) {
        const objRoutParsedCurrent = listObjRoutParsedUpdate[ idObjRoutParsedCurrent ];

        console.log('objRoutParsedCurrent', objRoutParsedCurrent);

        hashUpdated += '@' + objRoutParsedCurrent.id + ':' + objRoutParsedCurrent.path;

        if ( typeof objRoutParsedCurrent.listObjAttribute !== 'undefined' ) {
          hashUpdated += '?';
          let noAttribute = 0;
          Object.keys(objRoutParsedCurrent.listObjAttribute).forEach(attributeKey => {
            if ( 0 < noAttribute)
              hashUpdated += '&';

            const attributeValue = objRoutParsedCurrent.listObjAttribute[ attributeKey ];
            // Boolean
            if ( typeof attributeValue === 'boolean' && attributeValue) {
              hashUpdated += attributeKey;
            // Anything but Boolean
            } else {
              hashUpdated += attributeKey + '=' + objRoutParsedCurrent.listObjAttribute[ attributeKey ];
            }

            noAttribute++;
          });
        }

        console.log('hashUpdated', hashUpdated);
      }

    // Single Rout on record
    } else {

    }

    return hashUpdated;
  }
}

export * from './Rout';
export const router = new Router();
export default router;