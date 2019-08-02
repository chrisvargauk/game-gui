# game-gui
Yet another UI framework: fine-tuned for Game Development in the Browser. The 20% of modern UI frameworks that makes them great and NOT the 80% that makes them slow.

If you know React, Game GUI will be intuitive to use. 
Dumb and Smart Components, State and Virtual DOM is here to stay.

Source Code is short, easy to interface with or modify/customize if need - MIT License, 
do what ever you want, just don't blame me for anything ;)  
You can control when your rendering takes place, 
therefore you can align it with your Game Engines rendering cycle.

### Hello World
```javascript
import GameGUI, {Component} from 'game-gui';

class MyComp extends Component {
  render () {
    return `
      <div class="my-comp">
        Hello World!
      </div>
    `;
  }
}

const gui = new GameGUI(MyComp, '#ui-root');
```

### Mix HTML and Javascript
```javascript
class MyComp extends Component {
  render () {
    const list = ['foo', 'bar'];

    return `
      <div class="my-comp">
        Rendering List:<br>
        ${ list.map(item => (`<div>${item}</div>`))
               .join('')
        }
      </div>
    `;
  }
}
```

### Click Handler - Built in Handlers
Built in handlers will be binded automatically when rendering is complete.  
Note: See Life-cycle section for manual binding. 
```html
<button ui-click="myClickHandler">Click Me!</button>
```
```javascript
class MyComp extends Component {
  render () {
    return `
      <div class="my-comp">
        <button ui-click="myClickHandler">Click Me!</button>
        <div ui-click="myClickHandler">Click Me!</div>
      </div>
    `;
  }

  myClickHandler() {
    alert('click');
  }
}
```

### Dumb Components - Comp in Comp
Use Dumb Components for modularizing simple UI elements that doesn't require their own sate.  
Include Smart or Dumb Components inside each-other or use them inside iterators.
```javascript
const MyDumbComp = ( item ) =>
  (`<div class="dumb-comp">${item}</div>`);

class MyComp extends Component {
  render () {
    const list = ['foo', 'bar'];

    return `
      <div class="my-comp">
        ${this.include(MyDumbComp, 'Included Dumb Comp in HTML')}

        Rendering List:<br>
        ${ list.map(item => this.include(MyDumbComp, item))
               .join('')
        }
        </div>
      `;
  }
}
```

### Smart Component and State
Use Smart Components if your UI element requires it's own state.
```javascript
class MySmartComp extends Component {
  constructor () {
    super();

    this.setState({
      ctr: 0
    });
  }

  render () {
    return `
      <div class="my-smart-comp">
        <div ui-click="handlerUpdateLabel">
          Click Me: ${this.getState().ctr}
        </div>
      </div>
    `;
  }

  handlerUpdateLabel() {
    this.setState({
      ctr: this.getState().ctr + 1
    })
  }
}
```

### Life Cycle Methods
Define ```afterRender()``` method on your Smart Components to do anything right after the Component gets rendered, e.g.: do your own bindings.  
Note: Don't worry about Child Components content, e.g. selector picking up HTML from Child Component. 
```afterRender()``` is called before Child Components get rendered, therefore you can trust encapsulation.
Also note, running the query on the Components DOM Section only by using ```this.dom.querySelector(..```  
```javascript
class MySmartComp extends Component {
  render () {
    return `
      <div class="my-smart-comp">
        <button class="rendered-button">Hover Over Me!</button>
      </div>
    `;
  }

  afterRender() {
    this.dom.querySelector('.rendered-button').addEventListener('mouseover', () => {
      alert('You Hovered Over Me!');
    }, false)
  }
}
```

### ES6, CJS, AMD, UMD
dist/GameGUI is built with UMD, therefore you are free to chose what module definition you prefer to use in 
your own project.

# Contribute
https://github.com/chrisvargauk/game-gui