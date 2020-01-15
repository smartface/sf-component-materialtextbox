# Material TextBox
## materialTextBox @ 1.4.0

A marketplace component to overcome the quirks of [MaterialTextBox](http://ref.smartface.io/#!/api/UI.MaterialTextBox) to make it easier to use.

## Installation: 
- Open the **Marketplace - beta** on the right corner at Smartface IDE & download **Material Text Box**
- Drag & drop the downloaded **FlMaterialTextBox** component to your `page` or `library component` on the Smartface UI editor at **marketplace** section

## Features:
- Drop-down arrow and a function to invoked upon click
- Clear all functionality for both platforms instead of X button on iOS
- Show / Hide functionality for senstivie informations like passwords

## Usage : 

Options object will be assigned directly onto UI.MaterialTextBox class. You can also use platform specific values under it, 

```javascript
function setMaterialTextBox() {
    const page = this; // Assuming this function is binded to the page.
    const { flEmail } = page;
    flEmail.options : { 
        hint: "Email Address",
        className: ".login" //Documented under theming section, a custom variable for multi theme
    };
    flEmail.clearAllEnabled = true;
    flEmail.showHideEnabled = true;
    flEmail.enableDropDown = true; // Use this if you ONLY want to have the icon.
    flEmail.onDropDownClick = () => {
        // Define your function on what to do on the event. It will automatically add the image, therefore, no need to toggle enableDropDown if this is used.
    }
}
```

Alternatively, you can create your own **materialTextBox** object and add it to the component at will. Example :

```javascript
const MaterialTextBox = require("sf-core/ui/materialtextbox");

function setMaterialTextBox() {
    const page = this; // Assuming this function is binded to the page.
    const { flEmail } = page;
    const signInMaterialTextBox = new MaterialTextBox({
        hint: "Sign In",
        text: "info@smartface.io"
    });
    flEmail.initMaterialTextBox(signInMaterialTextBox); // Second parameter ( optional ) is className
    // To add a barebone materialTextBox, use addChild() method of contx.
    flEmail.addChild(signInMaterialTextBox, "materialTextBox", ".materialTextBox");
    page.signInMaterialTextBox = signInMaterialTextBox;
}
```
The latest materialTextBox instance you create will override the previous one.

> Learn more about addChild at [contxjs.](https://github.com/smartface/contxjs)

To access the **materialTextBox** itself, follow this behavior
```javascript
    function onLoad() {
        const page = this;
        page.setMaterialTextBox();
        const { flEmail } = page;
        flEmail.materialTextBox.onActionButtonPressed = () => {
            alert("Action button pressed");
            flEmail.materialTextBox.text = "sales@smartface.io";
        };
    }
```

> To know about Material textbox better, follow [this guide](https://developer.smartface.io/docs/materialtextbox) for better understanding.

## Remarks
All of the properties in materialTextBox will work. You can give platform specific value directly into the object.

> Do not use custom properties like **clearAllEnabled** at options definition, that will be ignored.

> **IMPORTANT NOTE** : Initializing **FlMaterialTextBox** on the constructor might cause unexpected errors and styles for **materialTextBox** will not be applied, because the component is not in the context. Make your implementation in `onShow()` or `onLoad()` methods on the page.

> **ADDITIONAL NOTE for adding to a library component** : Use [Object.defineProperties()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties) or a `function` for your code and call it on `onShow()` or `onLoad()` methods of the parent page.


```javascript
const FlMaterialTextBox = require("sf_modules/materialtextbox");

function onLoad(superOnLoad) {
    superOnLoad();
    const page = this;
    const flEmail = new FlMaterialTextBox();
    page.layout.addChild(flEmail, "flSignIn", ".materialTextBox-wrapper");
    flEmail.options = { 
        hint: "Enter Email"
    };
}
```

## Theming and customization

> The default theme implementation is under `/themes/baseTheme/styles/default/materialTextBox.json` file. DO NOT make changes on this file.

> To change the themes as you like, simply create `themes/${selectedTheme}/styles/default/materialTextBox.json` with your changed styles. You can find best practices for theming under [smartface documentations.](https://developer.smartface.io/docs/using-themes-in-apps)

> To use multiple themes across one project, simply add subclasses under .materialTextBox class and customize it as you like.

```javascript
    ".materialTextBox": {
        ...,
        ".login": {
            "ellipsizeMode": "START",
        },
        "&-password": {
            "textAlignment": "MIDRIGHT" 
        }
    },
```

```javascript
    flEmail.options : { 
        hint: "Email Address",
        className: ".login" //Will inherit default class themes 
    };
    flPassword.options : { 
        hint: "Email Address",
        className: "-password" //Will not inherit default class themes
    };
```

The className property will be appended directly into the class which materialTextBox will use. 

```javascript
    const class = `.materialTextBox${className}`;
```

> Due to technical limitations, the height of wrapper and materialTextBox inside of it **must be** equal

## Update
- Run `npm install` under scripts directory.

## Contribution
- Check [CONTRIBUTING.md](https://github.com/smartface/component-materialtextbox/blob/master/CONTRIBUTING.md).

## Feedback
* [File an issue](https://github.com/smartface/component-materialTextBox/issues)
* Follow [@smartface](https://twitter.com/smartface_io) and let us know what you think!

Author : furkan.arabaci@smartface.io
generated by **smartface** 2020.
    