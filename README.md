[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/chrisvargauk/game-gui) 

# game-gui
Yet another UI Framework: fine-tuned for Game Development in the Browser. The 20% of the modern UI Frameworks that makes them great and NOT the 80% that makes them slow.

Popular UI Frameworks expect you to include everything into their context/scope.
This approach might work well for websites or web apps, but there are cases like a Game Engine,
where it makes more sense to include UI Framework into the Game Engine, then the other way around. 

If you know React, Game GUI will be intuitive to use. 
Dumb and Smart Components, State and Virtual DOM is here to stay.

Source Code is short, easy to interface with or modify/customize if need - MIT License, 
do what ever you want, just don't blame me for anything ;)  
You can control when your rendering takes place, 
therefore you can align it with your Game Engines rendering cycle.

### Hello World

---
```javascript
import GameGUI, {Component} from 'game-gui';

class MyComp extends Component {
  render () {
    return `
      <span>Hello World!</span>
    `;
  }
}

const gameGUI = new GameGUI(MyComp, '#ui-root');
```

### Mix HTML and Javascript

---
```javascript
class MyComp extends Component {
  render () {
    const list = ['foo', 'bar'];

    return `
      Rendering List:<br>
      <ul>
        ${ list.map(item => (`<li>${item}</li>`))
               .join('')
        }
      </ul>
    `;
  }
}
```

### Built in Event Handlers - Click, Link

---
Built in Event Handlers will be bound automatically when rendering is complete.  
Note: See Life-cycle section for manual binding.

#### Click Event Handler 
```html
<button gui-click="myClickHandler">Click Me!</button>
```
```javascript
class MyComp extends Component {
  render () {
    return `
      <button gui-click="myClickHandler">Click Me!</button>
      <div gui-click="myClickHandler">Click Me!</div>
    `;
  }

  myClickHandler(DOMNode, eventType, event) {
    alert('click');
  }
}
```

#### Link Event Handler 
```html
<button gui-href="#settings/account">Go to Account Settings</button>
```
```javascript
class MyComp extends Component {
  render () {
    return `
      <button gui-href="#settings/account">Go to Account Settings</button>
      <div gui-href="#settings/general">Go to General Settings</div>
    `;
  }
}
```

### Dumb Components - Comp in Comp

---
Use Dumb Components for modularizing simple UI elements that doesn't require their own sate.  
Include Smart or Dumb Components inside each-other or use them inside iterators.
```javascript
const MyDumbComp = ( item ) =>
  (`<li class="dumb-comp">${item}</div>`);

class MyComp extends Component {
  render () {
    const list = ['foo', 'bar'];

    return `
      Rendering List:<br>
      <ul>
        ${ list.map(item => this.include(MyDumbComp, item))
               .join('')
        }

        ${this.include(MyDumbComp, 'Included Dumb Comp in HTML')}
      </ul>
    `;
  }
}
```

### Smart Component and State

---
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
      <div gui-click="handlerUpdateLabel">
        Click Me: ${this.getState().ctr}
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

---
##### afterRender() 
Define `afterRender()` method on your Smart Components to do anything right after the Component gets rendered, e.g.: do your own bindings.  
Note: Don't worry about Child Components content, e.g. selector picking up HTML from Child Component. 
```afterRender()``` is called before Child Components get rendered, therefore you can trust encapsulation.
Also note, running the query on the Components DOM Section only by using ```this.dom.querySelector(..```  
```javascript
class MySmartComp extends Component {
  render () {
    return `
      <button class="rendered-button">Hover Over Me!</button>
    `;
  }

  afterRender() {
    this.dom.querySelector('.rendered-button').addEventListener('mouseover', () => {
      alert('You Hovered Over Me!');
    }, false)
  }
}
```

##### afterInstantiation() 
`afterInstantiation( dataFromParent )` method on your Smart Component if defined runs 
right after the constructor is done running and Component is ready to function properly - technically 
you should define an `afterInstantiation` method on your Smart Component instead of a `constructor` method.  
It receives `dataFromParent` passed in at inclusion `..${this.include(ClassComp, dataFromParent, config)}..`,
also `this.config` and `this.option` are available by the time `afterInstantiation( dataFromParent )` is called. 
```javascript
class MySmartComp extends Component {
  render () {
    return `
      <button class="rendered-button">Hover Over Me!</button>
    `;
  }

  afterInstantiation() {
    console.log("I'm ready");
  }
}
```

### Hook Up External Event Handlers

---
Use `gui.addEventListener(EventType, callback);` to register in as many Event Handlers as you like.

##### "DOMContentLoaded" Event Handler
`DOMContentLoaded` Event Handler is called after all the Components are rendered the very first time. 
It is meant to replace `DOMContentLoaded` DOM Event.   
```javascript
gui.addEventListener('DOMContentLoaded', eventType => {
  //..
});
```

##### "rendered" Event Handler
`rendered` Event handlers is call every time any part of the UI gets re-rendered. 
If multiple Components get re-rendered, your event handlers will be called only once, 
when all the rendering activity is complete and the UI is in it's final state.   
```javascript
gui.addEventListener('rendered', eventType => {
  //..
});
```

### Include Syntax in Details - dataFromParent, config, option

---
`..${this.include(ClassComp, dataFromParent, config)}..`  
`ClassComp`: Any Dump or Smart Component to render where include is called  
`dataFromParent`: variable - primitive or object, passed down from where include is called to the included Component.
It is available in Dumb and Smart Components, and updated at every re-render of the Parent Component.
```javascript
const DumbComp = dataFromParent => (`
Data passed down at inclusion: ${dataFromParent}
`); 
```
```javascript
class SmartComp {
  render (dataFromParent) {
    return `
     Data passed down at inclusion: ${dataFromParent}
   `; 
  }
}
```  
`config`: Config is only available for Smart Components through `this.config`. 
It's a Configuration Object, that usually come from some static source, like a JSON file - could be add hock as well though, e.g. `..${this.include(ClassComp, dataFromParent, {age: 32})}..`  
Meaning, it will be evaluated only once, when Smart Component is instantiated. 
Therefore if a re-render triggered in the Parent Component, and the Config has changed that you pass in at inlcusion, 
that change has no effect on the Config in the Smart Component Instance.
That said, you can even extend that Config, `this.config.foo = bar;` for example in `afterInstantiation` method,
and you don't have to worry about that being overwrite at subsequent re-renders.
`dataFromParent` on the other hand will be update and passed in to "render" method, 
every time the Parent Comp is re-rendered.  

`option`: a Global Object in the scope of Game GUI, therefore we pass it along to every Child Comp automatically,
hence making it available in every Smart Component through 'this.option' - Not Available in Dumbt Components.  
It is created when GameGUI is instantiated: `const gui = new GameGUI(RootComp, '#ui-root', option);`, 
therefore you can use it as a portal to the "outside world"
```javascript
const option = {
  thirdPartyClickHandler: thirdPartyApiOrObject.clickHandler,
};
const gui = new GameGUI(RootComp, '#ui-root-id-selector', option);

class MySmartComp extends Component {
  render () {
    return `
      <button gui-click="handlerUpdateLabel">Click Me! </button>
    `;
  }

  handlerUpdateLabel() {
    this.option.thirdPartyClickHandler()
  }
}
```

### ES6, CJS, AMD, UMD

---
dist/GameGUI.js is built with UMD, therefore you are free to chose what module definition you prefer to use in 
your own project.

# Router

Game GUI comes with a built in Router with a twist. 
This is a custom Router, designed to solve issues with Web Apps and not Web Sites,
therefore design decisions might look unreasonable for Web Developers used to Routes designed for Websites.
You can read more about that twist in "Independent Multi-Routs" section.

### Single Rout - "Hello World" Rout

---

To start simple, let's use a single Rout to render a corresponding Component.  
Let's render `SettingsAccount` Dumb Component when Address Bar says, `mywebapp.com/#settings/account`.

Create `SettingsAccount` Component:
```javascript
const SettingsAccount = () => `This is Rout "settings/account"`;
```

Click an HTML link that refers to `SettingsAccount` Component:
```html
<a href="#settings/account">Go to Settings / Account</a>
```

Include `SettingsAccount` Component, as a Rout Component.  
*Technically you have to include the build in `Rout` Component, 
and pass in `SettingsAccount` Component as Config.* 
```javascript
import {Rout} from 'game-gui';
...
${this.include(Rout, 'settings/account', SettingsAccount)}
```
Please Note: In order to start using `Rout` Components, 
you have to initialize your `router` by passing in your `Game GUI Instance`.  
If you forget to do this, your `gui-href` type links wont work. 
```javascript
import GameGUI, {router} from 'game-gui';
...
const gameGUI = new GameGUI(MyRootComp, '#ui-root');
router.init( gameGUI );
```

### Single Rout - Path and Data

---
Let's see what if we would like to provide some Data along the Path.  
Path: settings/account, name: Jane, age: 22, boolean: foo

Create an HTML Link that contains the Path and all the Data   
```html
<a href="#settings/account?name=Jane&age=22&foo">Go to Settings / Account</a>
```
*Note: the way we define Data in the Address Bar is less fancy than most Routing System would do: 
`settings/account/Jane/22/foo` vs here `#settings/account?name=Jane&age=22&foo`.
Mostly you need the fancy way because of SEO - Search Engine Optimisation, but in our case, 
in a Game Engine there is not much for the Search Engines to crawl.*

Include `SettingsAccount` Component, as a Rout Component.
```javascript
${this.include(Rout, 'settings/account', SettingsAccount)}
```

Create `SettingsAccount` Component. 
Data from the Address Bar / Hash is passed in as Key Value Pairs 
through the First Attribute Object - called `dataInHash` in this example.
```javascript
const SettingsAccount = (dataInHash) =>(`
  This is Rout "settings/account",
  name: ${dataInHash.name},
  age: ${dataInHash.age},
  ${dataInHash.foo ? 'foo' : 'no foo'}
`);
```

### Independent Multi-Routs

---
As long as your Router only controls the State of a single Website or Web App in a Browser Tab,
current Routers can do that for you, 
but what if you want two independent Window Components running in the same Browser Tab, 
just like you have multiple apps running in your OS in multiple windows.  
You might say, this is the Browser, way would I ever want to have two windows in a single Browser Tab.
So let's have a look at a practical example:

You have two Components, Game and Menu.     
When you navigate the Menu, Menu is controlled by the Router, 
therefore the Path shows up in the Address Bar. e.g: `wwww.mygame.com/menu/settings/account`.  
Now, when you are in a Multi-player Game Session, and you want your friend to join you, 
you send them a link with the Session ID in it. e.g: `wwww.mygame.com/multiplayer/1234`.  

Therefore, you have the Menu and the Game, both controlled by the Link in the Address Bar. 
Now, you are in trouble, because the Path can trigger/activate only one of the Components at any time.
That said, you are either playing in Multi-player or navigating the Menu while the Game is inactive.  

Obviously, there are workarounds, but the easiest way to manage the situation would be 
if the Link in the Address Bar could control both at the same time and independently.  
 
E.g: `wwww.mygame.com/#game:multiplayer?session=1234|menu:settings/account`

##### gui-href
Use `gui-href` on any HTML Tag, button or div doesn't matter, to navigate to a Path/Rout. 
The Path is the value, `gui-href="my/path"`.  
```html
<button gui-href="#settings/account?name=Jane&age=22&foo">Jane's Account</button>
..vs..
<a href="#settings/account?name=Jane&age=22&foo">Jane's Account</a>
```

##### gui-href=".." vs href=".."
Consider the following link:  
`wwww.mygame.com/#game:engine?state=running|menu:settings/account`

Let's say you start clicking on the following links:
```html
<a href="#menu:settings/account">Account</a>
<a href="#menu:settings/general">General</a>
<a href="#game:engine?state=running">Start Game Engine</a>
<a href="#game:engine?state=stopped">Stop Game Engine</a>
```
When you click `<a href="#menu:settings/general">General</a>`, 
your path gets reduced to `wwww.mygame.com/#menu:settings/general`, 
therefore Game Component doesn't get rendered anymore, 
because `game:engine?state=running` is missing from the Address Bar.  
Ideally, by clicking on `<a href="#menu:settings/general">General</a>`,
you only want to change the relevant part of the Address Bar, and leave the rest as is.

Using `gui-href=".."` modifies only the relevant part of the Address Bar.
```html
<a href="#menu:settings/general">General</a>
..vs..
<button gui-href="#menu:settings/general">General</button>
```   
If Address Bar says `wwww.mygame.com/#game:engine?state=running|menu:settings/account`,
then you click `<button gui-href="#menu:settings/general">General</button>`,
Address Bar will say `wwww.mygame.com/#game:engine?state=running|menu:settings/general`.

### Nested Routs

---
To control your Component and Sub Components structure by using Links, 
you have to nest Routs inside other Routs.

If you want a Rout called Settings and another Rout inside called Account,
first you need to create the corresponding Links:    
```html
<a href="#settings">Go to Settings</a>
<a href="#settings/account">Go to Settings / Account</a>
```
Then you can include your Settings Rout Component into your Main/Root Component - or any other Component for that matter.
```javascript
`..${this.include(Rout, 'settings', CompSettings)}..`
```
Then inside your Settings Rout Component, you can include your Nested Rout Component called Account.
```javascript
const CompAccount = () => (`
  <h3>Account<h3>
  Someones account details come here..
`);

class CompSettings extends GameGUI.Component{
  render() {
    return (`
      <h2>Settings</h2>
      ${this.include(GameGUI.Rout, 'settings/account', CompAccount)}
    `);
  }
}
```
*Note: You can have Routs inside Smart Components only, but you can include a Dumb Component as a Rout Component.*

### Nested Routs - Partial Matching to the Left

---
Consider the the following Links:
```html
<a href="#settings">Go to Settings</a>
<a href="#settings/account">Go to Settings / Account</a>
```

When you have a Nested Rout inside Parent Rout, 
the Parent Rout will be rendered for both Links, 
the link for the Parent Rout and the Nested Rout as well.  
E.g. Setting Rout Component will be Rendered for Link `#settings`, 
and it will be rendered when you go to Link `#settings/account`.  
This way your can completely control your Component and SubComponent structure 
by partially matching the corresponding Parent Components Link/Path to the Nested Components Link/Path.  
`#settings` Link/Path partially matching `#settings/account` Link/Path. 

### IDs and Routs

---
Path can be used as an ID.
```html
<a href="#settings/account">Account</a>
<a href="#settings/general">General</a>
``` 
We can use those paths - `settings/account`, `settings/account` - as IDs 
to include the corresponding Rout Components.
```javascript
${this.include(Rout, 'settings/account', CompSettingsAccount)}
${this.include(Rout, 'settings/general', CompSettingsGeneral)}
```

When you use Multi-Routs, you have to include the unique Rout IDs, 
both in the Link and the Rout Inclusion as well.
Note: Link can be both `gui-href=".."` and `href=".."`.
```html
<button gui-href="#menu:settings/account">Account</button>
<button gui-href="#game:engine?state=running">Account</button>
```
```javascript
${this.include(Rout, 'menu:settings/account', CompSettingsAccount)}
${this.include(Rout, 'game:settings/general', CompSettingsGeneral)}
```

### Why having "#" in the Path?

---
Although HTML5 gave us the ability to get rid of the `#` from the Address Bar, 
that is beneficial for Websites because of SEO - Search Engine Optimisation, 
but for Web Apps whats beneficial is to be specific about 
which part of the Link is meant to control the server-side and 
which part of that Link is meant to control the Web App running on the client-side.  
E.g. for Website Links you want `www.mypage.com/all/the/keywords/for/seo`, and 
for Web App Links you want `www.myapp.com/server/do/this#client?do=this`.
That's why Isomorphic Websites were hot back in 2015-2016. 
Meaning, Isomorphic Page is rendered on server-side when you go to a link `www.mypage.com/all/important/states/here`, 
than client-side JavaScript takes over the Address Bar and continues rendering the Isomorphic Website.  
It was considered important for Google Crawler to get a page rendered, 
when the Crawler hits the page `www.mypage.com/all/important/states/here` without JavaScript running on the client-side.

### External API for Router

---
For a Game Engine its important not to include the Game Engine itself inside the UI Framework,
but the Game Engine has to interact with the UI Framework. 
One way of interacting is to react to Links just like the UI/GUI does by utilizing Routs.

In the UI you can use Routs to react to Links, 
in a Game Engine, you can subscribe to Links:
```javascript
router.rout('#game/state?do=this', dataInHash => {
  console.log('game/state fired for Subscriber using API, not Comp.', dataInHash.do);
});
```

It's practical to get notified when the User navigates away from a Link you've subscribed to in a Game Engine,
to do some clean up you may need. 
This destructor callback will only be called if Link was already triggered, and only once per trigger.
```javascript
router.rout('#game/state?do=this', dataInHash => {
  console.log('game/state fired for Subscriber using API, not Comp.', dataInHash.do);
}, dataInHash => {
  console.log('game/state Destructor firing.', dataInHash.do);
});
```
*Note: the `dataInHash` in the Destructor Callback is the same as what was provided when the User hit the link,
not the Data coming from the next Link that caused the call to the Destructor Callback.*
# Contribute
https://github.com/chrisvargauk/game-gui