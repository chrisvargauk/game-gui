export class Router {
  constructor() {
    this.listObjRoutParsedCurrent = {};
    this.listSub                  = [];
    this.listObjPathListSub       = {}; // note: this is for debugging only

    window.addEventListener("hashchange", this.handlerHashChange.bind( this ), false);
    this.handlerHashChange();
  }

  init( gui ) {
    gui.registerBinding('gui-href', 'click', url => {
      this.updateHash( url );
    });
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
    if (hash.indexOf('|') === -1 ) {
      return [hash];

    // Multiple Routs in hash
    } else {
      return hash.split('|')
                 .filter( rout => rout !== '');
    }
  }

  processRout( rout ) {
    const routProcessed = {
      id:               null,
      listObjAttribute: {},
      path:             null
    };

    let routRemaining;
    // Find "id" in Rout if any. Not having "id" is valid syntax
    // E.g: "gui:menu/main" => id === 'gui', or "menu/main" => id === undefined.
    // Note: "#" is already removed from Rout
    if ( rout.indexOf(':') !== -1 ) {
      const routListPartById = rout.split(':');
      routProcessed.id = routListPartById[ 0 ];
      routRemaining = routListPartById[ 1 ];
    } else {
      routProcessed.id = 'noId';
      routRemaining = rout;
    }

    // If at least one Attribute provided in Rout
    if ( routRemaining.indexOf('?') !== -1 ) {
      const listPartByQuestionmark = routRemaining.split('?');
      routProcessed.path      = listPartByQuestionmark[0];
      const strListAttribute  = listPartByQuestionmark[1];
      const listAttributeStr  = strListAttribute.split('&');

      // Turn Attribute String into Attribute Key Value Pair.
      // E.g. "user=Jane" => listObjAttribute['user'] = 'Jane';
      // E.g. "foo"       => listObjAttribute['foo']  = true;
      listAttributeStr.forEach(attributeStr => {
        if ( attributeStr.indexOf('=') !== -1 ) {
          const listPartByEqualSign = attributeStr.split('=');
          routProcessed.listObjAttribute[ listPartByEqualSign[0] ] = listPartByEqualSign[1];
        } else {
          routProcessed.listObjAttribute[ attributeStr ] = true;
        }
      });

    // If NO Attribute is provided in Rout
    } else {
      routProcessed.path = routRemaining;
    }

    return routProcessed;
  }

  handlerHashChange () {
    const listRoutStr = this.getListRout();
    const listObjRoutParsedCurrentUpdate = {};
    listRoutStr.forEach( routStr => {
      const routObj = this.processRout( routStr );
      listObjRoutParsedCurrentUpdate[ routObj.id ] = routObj;
    });

    this.listObjRoutParsedCurrent = listObjRoutParsedCurrentUpdate;

    this.fireAllSub();
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

    // Filter off Path ID from "pathToMatch"
    // E.g. "somePathId:my/path" -> pathToMatch = "my/path"; idToMatch = 'somePathId'
    let listPartPath = pathToMatch.split(':');
    let idToMatch = 1 < listPartPath.length ? listPartPath[0] : 'noId';
    pathToMatch   = 1 < listPartPath.length ? listPartPath[1] : listPartPath[0];

    // Search
    // Iterate List of Current Routs/Paths
    for ( let idListRout in this.listObjRoutParsedCurrent) {
      const routParsedCurrent = this.listObjRoutParsedCurrent[ idListRout ];

      // If Current Routs/Paths Iter matching Path that we are searching for
      if (routParsedCurrent.id === idToMatch &&
          // Note: Partial Matching to Left: Match it only to the left, e.g.: main/setting & main/setting/audio
          routParsedCurrent.path.indexOf(pathToMatch) === 0
      ) {
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
          fnToCallIfMatch.listObjAttribute = routParsedCurrentMatching.listObjAttribute;
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
        fnToCallIfDoesntMatch( fnToCallIfMatch.listObjAttribute );
        fnToCallIfMatch.listObjAttribute = null;
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
    // Collect List of Routs as List of Strings rep. Routs
    const listRoutStr = this.getListRout( hashNew );

    // Process List of Routs as String to Obj
    const listObjRoutParsedNew = {};
    listRoutStr.forEach( routStr => {
      const routObj = this.processRout( routStr );
      listObjRoutParsedNew[ routObj.id ] = routObj;
    });

    // Update List of Hash on record
    const listObjRoutParsedUpdate = {
      ...this.listObjRoutParsedCurrent,
      ...listObjRoutParsedNew
    };

    const hashUpdated = this.reconstructHash( listObjRoutParsedUpdate );
    location.hash = hashUpdated;
  }

  reconstructHash( listObjByIdRoutObj ) {
    let hashReconstructed = '';

    // Multiple Rout Objects
    if ( 1 < Object.keys(listObjByIdRoutObj).length ) {
      let ctrRout = 0;

      // Iterate over the List of Rout Objects
      for (let idRoutObj in listObjByIdRoutObj) {
        const routObjIter = listObjByIdRoutObj[ idRoutObj ];

        // Add Rout Divider "|" if there are multiple Routs
        if (ctrRout) hashReconstructed += '|';

        // Reconstruct first part, ID + Path
        hashReconstructed += routObjIter.id + ':' + routObjIter.path;

        // Reconstruct Attributes from Rout Iter to Hash format, if any
        hashReconstructed = this.reconstructHashAttributeAll( hashReconstructed, routObjIter );

        ctrRout++;
      }

    // Single Rout on record
    } else {
      const idRoutObj = Object.keys( listObjByIdRoutObj )[ 0 ];
      const routObj = listObjByIdRoutObj[ idRoutObj ];

      // Reconstruct first part, ID + Path
      hashReconstructed += routObj.id + ':' + routObj.path;

      // Reconstruct Attributes from Rout to Hash format, if any. E.g.: ..bar=2&foo&..
      hashReconstructed = this.reconstructHashAttributeAll( hashReconstructed, routObj );
    }

    return hashReconstructed;
  }

  reconstructHashAttributeAll( hashReconstructed, routObj ) {
    // If Rout Iter contains Attributes
    if ( 0 < Object.keys(routObj.listObjAttribute).length ) {
      hashReconstructed += '?';
      let ctrAttribute = 0;

      // Iterate over Rout Attributes
      Object.keys( routObj.listObjAttribute ).forEach( attributeKey => {
        const attributeValue = routObj.listObjAttribute[ attributeKey ];

        // Add Attribute Divider "&" if there are multiple Attributes
        if ( 0 < ctrAttribute ) hashReconstructed += '&';

        // If Boolean Attribute, e.g.: ..bar=2&foo&.. => foo === true
        if ( typeof attributeValue === 'boolean' ) {
          hashReconstructed += attributeKey;

          // Any type of Attribute but Boolean
        } else {
          hashReconstructed += attributeKey + '=' + routObj.listObjAttribute[ attributeKey ];
        }

        ctrAttribute++;
      });
    }

    return hashReconstructed;
  }
}

// Export a Single Router Instance, because we only want one Router that is aware of all the Routs
export const router = new Router();