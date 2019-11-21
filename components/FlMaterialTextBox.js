"use strict";
const extend = require('js-base/core/extend');
const System = require("sf-core/device/system");
const Screen = require("sf-core/device/screen");
const FlMaterialTextBoxDesign = require('library/FlMaterialTextBox');

const Label = require("sf-core/ui/label");
const FlexLayout = require("sf-core/ui/flexlayout");
const MaterialTextBox = require('sf-core/ui/materialtextbox');

const { getCombinedStyle } = require("sf-extension-utils/lib/getCombinedStyle");
const componentContextPatch = require("@smartface/contx/lib/smartface/componentContextPatch");

var height = getCombinedStyle(".materialTextBox-wrapper").height;
var hintFont = getCombinedStyle(".materialTextBox-hintFont").font;
var labelsFont = getCombinedStyle(".materialTextBox-labelsFont").font;

const RightLayoutTemplate = {
    showHide: 0,
    clearAll: 1
};

Object.freeze(RightLayoutTemplate);

const FlMaterialTextBox = extend(FlMaterialTextBoxDesign)(
    function(_super, props = {}, pageName) {
        _super(this, props);
        this.pageName = pageName;
        this.initMaterialTextBox = initMaterialTextBox.bind(this);

        var arrowVisibility = false;
        var showHideEnabled = false;
        var clearAllEnabled = false;

        var options = props;
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
                    if (typeof value === "function" && this.materialTextBox) {
                        arrowVisibility = true;
                        setVisibility(this.imgDropDown, true);
                        if (System.OS === "iOS") {
                            this.onTouchEnded = value;
                            this.materialTextBox.touchEnabled = false;
                            this.materialTextBox.ios.clearButtonEnabled = false;
                        }
                        else {
                            this.materialTextBox.onTouchEnded = value;
                            this.materialTextBox.touchEnabled = true;
                        }
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

            options: {
                set: properties => {
                    let materialTextBox = createMaterialTextBox(properties);
                    this.initMaterialTextBox(materialTextBox);
                    options = properties;
                },
                get: () => options
            }
        });
    }
);

function changeOnTextChangedFunction() {
    const component = this;
    const { materialTextBox } = component;
    let textChanged = materialTextBox.onTextChanged;
    materialTextBox.onTextChanged = function() {
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
    materialTextBox.onEditBegins = function() {
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
    materialTextBox.onEditEnds = function() {
        // Override the existing function to have dynamic onTextChanged function
        if (materialTextBox.rightLayout && materialTextBox.rightLayout.view) {
            materialTextBox.rightLayout.view.visible = false;
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

    rightLayout.addChild(rightLabel, "mtbRightLabel", ".materialTextBox-rightLabel");
    initRightLayout(component, RightLayoutTemplate, visible);
}

function initRightLayout(component, RightLayoutTemplate, visible) {
    const { materialTextBox, rightLayout, rightLabel } = component;
    var showTitle = global.lang.show || "SHOW";
    var hideTitle = global.lang.hide || "HIDE";
    var clearAll = global.lang.clearAll || "CLEAR ALL";
    var rightLayoutWidth = 0;
    setVisibility(rightLayout, visible);
    switch (RightLayoutTemplate) {
        case 0: // SHOWHIDE
            rightLabel.text = showTitle;
            var showWidth = rightLabel.font.sizeOfString(showTitle, Screen.width / 2).width;
            var hideWidth = rightLabel.font.sizeOfString(hideWidth, Screen.width / 2).width;
            rightLayoutWidth = Math.max(showWidth, hideWidth);
            rightLayout.onTouchEnded = () => {
                let { isPassword, cursorPosition } = materialTextBox;
                rightLabel.text = isPassword ? hideTitle : showTitle;
                materialTextBox.isPassword = !isPassword;
                materialTextBox.cursorPosition = cursorPosition; // Android workaround for cursor moving around
            };
            break;
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
    var defaults = {
        // Other defaults can be found in materialTextBox.json
        ios: {
            clearButtonEnabled: true
        },
        android: {
            enableErrorMessage: true
        }
    };
    var purifiedOptions = Object.assign({}, defaults, options);
    var purifiedIOS = Object.assign({}, defaults.ios, options.ios || {});
    var purifiedAndroid = Object.assign({}, defaults.android, options.android || {});

    delete purifiedOptions.ios;
    delete purifiedOptions.android;

    var materialTextBox = new MaterialTextBox(purifiedOptions);

    Object.keys(purifiedIOS).forEach(key => materialTextBox.ios[key] = purifiedIOS[key]);
    Object.keys(purifiedAndroid).forEach(key => materialTextBox.android[key] = purifiedAndroid[key]);

    return materialTextBox;
}

function initMaterialTextBox(materialTextBox) {
    const component = this;
    materialTextBox.onTextChanged = materialTextBox.onTextChanged || function(e) {
        this.errorMessage = "";
    }.bind(materialTextBox);
    materialTextBox.ios.titleFont = hintFont;
    materialTextBox.labelsFont = labelsFont;

    component.addChild(materialTextBox, "materialTextBox", ".materialTextBox", userProps => {
        userProps.height = height;
        return userProps;
    });
    this.materialTextBox = materialTextBox;
}

module.exports = FlMaterialTextBox;
