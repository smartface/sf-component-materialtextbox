"use strict";
const System = require("sf-core/device/system");
const Screen = require("sf-core/device/screen");
const FlMaterialTextBoxDesign = require('../lib/FlMaterialTextBox');
const Label = require("sf-core/ui/label");
const FlexLayout = require("sf-core/ui/flexlayout");
const MaterialTextBox = require('sf-core/ui/materialtextbox');
const { getCombinedStyle } = require("sf-extension-utils/lib/getCombinedStyle");
const componentContextPatch = require("@smartface/contx/lib/smartface/componentContextPatch").default;
const { height: wrapperHeight } = getCombinedStyle(".materialTextBox-wrapper");
const RightLayoutTemplate = {
    showHide: 0,
    clearAll: 1
};
Object.freeze(RightLayoutTemplate);
FlMaterialTextBox.prototype = Object.create(FlMaterialTextBoxDesign.prototype);
function FlMaterialTextBox(props = {}, pageName) {
    FlMaterialTextBoxDesign.call(this, props);
    this.pageName = pageName;
    this.initMaterialTextBox = initMaterialTextBox.bind(this);
    let arrowVisibility = false;
    let showHideEnabled = false;
    let clearAllEnabled = false;
    let dropDownClick = false;
    let options = props;
    let trim = true;
    this.trim = trim;
    Object.defineProperties(this, {
        enableDropDown: {
            set: value => {
                arrowVisibility = value;
                setVisibility(this.imgDropDown, value);
                this.materialTextBox.ios.clearButtonEnabled = !arrowVisibility;
            },
            get: () => arrowVisibility
        },
        onDropDownClick: {
            set: value => {
                dropDownClick = typeof value === "function";
                if (System.OS === "iOS") {
                    this.onTouchEnded = (insInside) => dropDownClick && value(insInside);
                    this.materialTextBox.touchEnabled = !dropDownClick;
                }
                else {
                    this.materialTextBox.onTouchEnded = (isInside) => {
                        dropDownClick && value(isInside);
                        return dropDownClick;
                    };
                }
            }
        },
        showHideEnabled: {
            set: value => {
                if (this.materialTextBox) {
                    this.materialTextBox.ios.clearButtonEnabled = !value;
                    !showHideEnabled && createRightLayout(this, RightLayoutTemplate.showHide, false);
                    changeOnTextChangedFunction.call(this);
                    changeOnEditBeginsFunction.call(this);
                    changeOnEditEndsFunction.call(this);
                    showHideEnabled = value;
                }
            },
            get: () => showHideEnabled
        },
        clearAllEnabled: {
            set: value => {
                if (this.materialTextBox) {
                    this.materialTextBox.ios.clearButtonEnabled = !value;
                    !clearAllEnabled && createRightLayout(this, RightLayoutTemplate.clearAll, false);
                    changeOnTextChangedFunction.call(this);
                    changeOnEditBeginsFunction.call(this);
                    changeOnEditEndsFunction.call(this);
                    clearAllEnabled = value;
                }
            },
            get: () => clearAllEnabled
        },
        trim: {
            set: value => trim = value,
            get: () => trim
        },
        options: {
            set: properties => {
                const materialTextBox = createMaterialTextBox(properties);
                this.initMaterialTextBox(materialTextBox, properties.className);
                options = properties;
            },
            get: () => options
        }
    });
}
function changeOnTextChangedFunction() {
    const component = this;
    const { materialTextBox } = component;
    let textChanged = materialTextBox.onTextChanged;
    materialTextBox.onTextChanged = function () {
        // Override the existing function to have dynamic onTextChanged function
        if (materialTextBox.rightLayout && materialTextBox.rightLayout.view) {
            materialTextBox.rightLayout.view.visible = !!materialTextBox.text;
        }
        textChanged && textChanged();
    }.bind(component);
}
function changeOnEditBeginsFunction() {
    const component = this;
    const { materialTextBox } = component;
    let editBegins = materialTextBox.onEditBegins;
    materialTextBox.onEditBegins = function () {
        // Override the existing function to have dynamic onTextChanged function
        if (materialTextBox.rightLayout && materialTextBox.rightLayout.view) {
            materialTextBox.rightLayout.view.visible = !!materialTextBox.text;
        }
        editBegins && editBegins();
    }.bind(component);
}
function changeOnEditEndsFunction() {
    const component = this;
    const { materialTextBox } = component;
    let editEnds = materialTextBox.onEditEnds;
    materialTextBox.onEditEnds = function () {
        // Override the existing function to have dynamic onTextChanged function
        if (materialTextBox.rightLayout && materialTextBox.rightLayout.view) {
            materialTextBox.rightLayout.view.visible = false;
        }
        if (component.trim) {
            materialTextBox.text = removeWhiteSpaces(materialTextBox.text || "");
            materialTextBox.onTextChanged();
        }
        editEnds && editEnds();
    }.bind(component);
}
function createRightLayout(component, RightLayoutTemplate, visible) {
    component.rightLayout = new FlexLayout();
    component.rightLabel = new Label();
    const { materialTextBox, rightLayout, rightLabel } = component;
    if (!materialTextBox && !materialTextBox.iOS) return;
    componentContextPatch(rightLayout, "mtbRightLayout"); // TODO: use $$styleContext
    rightLayout.dispatch({
        type: "pushClassNames",
        classNames: [".materialTextBox-rightLayout"]
    });
    rightLayout.addChild(rightLabel, "mtbRightLabel", ".materialTextBox-rightLayout-rightLabel");
    initRightLayout(component, RightLayoutTemplate, visible);
}
function initRightLayout(component, RightLayoutTemplate, visible) {
    const { materialTextBox, rightLayout, rightLabel } = component;
    let showTitle = global.lang.show || "SHOW";
    let hideTitle = global.lang.hide || "HIDE";
    let clearAll = global.lang.clearAll || "CLEAR ALL";
    let rightLayoutWidth = 0;
    setVisibility(rightLayout, visible);
    switch (RightLayoutTemplate) {
        case 0: { // SHOWHIDE
            rightLabel.text = showTitle;
            let showWidth = rightLabel.font.sizeOfString(showTitle, Screen.width / 2).width;
            let hideWidth = rightLabel.font.sizeOfString(hideTitle, Screen.width / 2).width;
            rightLayoutWidth = Math.max(showWidth, hideWidth);
            rightLayout.onTouchEnded = () => {
                let { isPassword, cursorPosition } = materialTextBox;
                rightLabel.text = isPassword ? hideTitle : showTitle;
                materialTextBox.isPassword = !isPassword;
                materialTextBox.cursorPosition = cursorPosition; // Android workaround for cursor moving around
            };
            break;
        }
        case 1: // CLEARALL
            rightLabel.text = clearAll;
            rightLayoutWidth = rightLabel.font.sizeOfString(rightLabel.text, Screen.width / 2).width;
            rightLayout.onTouchEnded = () => {
                materialTextBox.text = "";
                materialTextBox.onTextChanged();
                materialTextBox.errorMessage = "";
                rightLayout.visible = false;
            };
            break;
        default:
            return;
    }
    materialTextBox.rightLayout = {
        view: rightLayout,
        width: rightLayoutWidth + 10 // Seems like sizeOfString is not enough to cut it, add a buffer.
    };
}
function setVisibility(component, visible) {
    if (component.dispatch) {
        component.dispatch({
            type: "updateUserStyle",
            userStyle: {
                visible
            }
        });
    }
    else {
        component.visible = visible;
    }
}
function createMaterialTextBox(options) {
    let defaults = {
        // Other defaults can be found in materialTextBox.json
        ios: {
            clearButtonEnabled: false
        },
        android: {
            enableErrorMessage: true
        }
    };
    let purifiedOptions = Object.assign({}, defaults, options);
    let purifiedIOS = Object.assign({}, defaults.ios, options.ios || {});
    let purifiedAndroid = Object.assign({}, defaults.android, options.android || {});
    delete purifiedOptions.ios;
    delete purifiedOptions.android;
    let materialTextBox = new MaterialTextBox(purifiedOptions);
    Object.keys(purifiedIOS).forEach(key => materialTextBox.ios[key] = purifiedIOS[key]);
    Object.keys(purifiedAndroid).forEach(key => materialTextBox.android[key] = purifiedAndroid[key]);
    return materialTextBox;
}
function initMaterialTextBox(materialTextBox, className = "") {
    const component = this;
    const materialClassName = `.materialTextBox${className}`;
    materialTextBox.onTextChanged = materialTextBox.onTextChanged || function () {
        this.errorMessage = "";
    }.bind(materialTextBox);
    component.materialTextBox && component.removeChild(component.materialTextBox);
    component.addChild(materialTextBox, "materialTextBox", materialClassName, userProps => {
        if (wrapperHeight) {
            userProps.height = userProps.height || wrapperHeight;
        }
        return userProps;
    });
    this.materialTextBox = materialTextBox;
    changeOnEditEndsFunction.call(component);
}

function removeWhiteSpaces(string) {
    const pattern = { startsWithWhiteSpace: /^\s+|\s+$/g, moreThanOneWhitespaceBetweenWords: /\s\s+/g };
    return string.replace(pattern.startsWithWhiteSpace, "").replace(pattern.moreThanOneWhitespaceBetweenWords, " ");
}

module.exports = FlMaterialTextBox;
