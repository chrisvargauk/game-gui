// http://localhost:8000/demo/demo-11-router.html#@menu:main/setting@game:running?user=Jane&age=20&foo
// http://localhost:8000/demo/demo-11-router.html#running?user=Jane&age=20&foo

// todo: rerender Comps at hash change

export class Router {
  constructor() {
    this.listRout = [];
    this.listObjPathToMatch = {};
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

    // Skip if non-standard Rout is presented
    if (hash.indexOf('@') === -1 ) {
      return [hash];
    }

    const listRout = hash.split('@').filter( rout => rout !== '');

    return listRout;
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
      path: (id ? id+':' : '')+path,
    }
  }

  handlerHashChange () {
    const listRoutRaw = this.getListRout();
    this.listRout = listRoutRaw.map(rout => this.processRout(rout));
    this.fireMatchAll();
    console.log('this.listRout:', this.listRout);
  }

  match( pathToMatch, fn ) {
    for ( let indexListRout=0; indexListRout<this.listRout.length; indexListRout++ ) {
      const rout = this.listRout[ indexListRout ];

      if ( rout.path === pathToMatch ) {
        return fn( rout.listObjAttribute );
      }
    }

    return '';
  }

  matchPath( pathToMatch, fn ) {
    this.listObjPathToMatch[ pathToMatch ] = fn;
  }

  fireMatchAll() {
    for (let pathToMatch in this.listObjPathToMatch) {
      const fn = this.listObjPathToMatch[ pathToMatch ];
      fn();
    }
  }
}

export default Router;