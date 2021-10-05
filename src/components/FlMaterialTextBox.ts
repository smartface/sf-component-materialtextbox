import System from "@smartface/native/device/system";
import Screen from "@smartface/native/device/screen";
import FlMaterialTextBoxDesign from "../generated/FlMaterialTextBox";
import Label from "@smartface/native/ui/label";
import FlexLayout from "@smartface/native/ui/flexlayout";
import MaterialTextBox from "@smartface/native/ui/materialtextbox";
import { getCombinedStyle } from "@smartface/extension-utils/lib/getCombinedStyle";
import componentContextPatch from "@smartface/contx/lib/smartface/componentContextPatch";
const { height: wrapperHeight } = getCombinedStyle(".materialTextBox-wrapper");
const RightLayoutTemplate = {
    showHide: 0,
    clearAll: 1
};
Object.freeze(RightLayoutTemplate);

type OptionType = Partial<MaterialTextBox> & { ios?: Partial<MaterialTextBox["ios"]>, android?: Partial<MaterialTextBox["android"]>, className?: string };

export default class FlMaterialTextBox extends FlMaterialTextBoxDesign {
    materialTextBox: MaterialTextBox;
    pageName?: string;
    private _arrowVisibility: boolean = false;
    private _showHideEnabled: boolean = false;
    private _clearAllEnabled: boolean = false;
    private _dropDownClick: boolean = false;
    private _options: OptionType = {};
    private _trim: boolean = true;
    constructor(props?: ConstructorParameters<typeof FlexLayout>, pageName?: string) {
        super(props);
        this.pageName = pageName;
    }

    get enableDropDown(): boolean {
        return this._arrowVisibility;
    }

    set enableDropDown(value: boolean) {
        this._arrowVisibility = value;
        this.setVisibility(this.imgDropDown, value);
        this.materialTextBox.ios.clearButtonEnabled = !this._arrowVisibility;
    }

    set onDropDownClick(value: any) {
        this._dropDownClick = typeof value === "function";
        if (System.OS === "iOS") {
            this.onTouchEnded = (isInside: boolean) => this._dropDownClick && value(isInside);
            this.materialTextBox.touchEnabled = !this._dropDownClick;
        }
        else {
            if (this._dropDownClick) {
                this.android.onInterceptTouchEvent = () => { return true; };
                this.onTouchEnded = (isInside: boolean) => {
                    this._dropDownClick && value(isInside);
                    return this._dropDownClick;
                }
            }
            else {
                //@ts-ignore
                this.android.onInterceptTouchEvent = null;
            }
        }
    }

    get showHideEnabled(): boolean {
        return this._showHideEnabled;
    }

    set showHideEnabled(value: boolean) {
        if (this.materialTextBox instanceof MaterialTextBox) {
            this.materialTextBox.ios.clearButtonEnabled = !value;
            !this._showHideEnabled && this.createRightLayout(this, RightLayoutTemplate.showHide, false);
            this.changeOnTextChangedFunction.call(this);
            this.changeOnEditBeginsFunction.call(this);
            this.changeOnEditEndsFunction.call(this);
            this._showHideEnabled = value;
        }
    }

    get clearAllEnabled(): boolean {
        return this._clearAllEnabled;
    }

    set clearAllEnabled(value: boolean) {
        if (this.materialTextBox instanceof MaterialTextBox) {
            this.materialTextBox.ios.clearButtonEnabled = !value;
            !this._clearAllEnabled && this.createRightLayout(this, RightLayoutTemplate.clearAll, false);
            this.changeOnTextChangedFunction.call(this);
            this.changeOnEditBeginsFunction.call(this);
            this.changeOnEditEndsFunction.call(this);
            this._clearAllEnabled = value;
        }
    }

    get trim(): boolean {
        return this._trim;
    }

    set trim(value) {
        this._trim = value;
    }

    get options() {
        return this._options;
    }

    set options(properties) {
        const materialTextBox = this.createMaterialTextBox(properties);
        this.initMaterialTextBox(materialTextBox, properties.className);
        this._options = properties;
    }

    changeOnTextChangedFunction = () => {
        const { materialTextBox } = this;
        let textChanged = materialTextBox.onTextChanged;
        materialTextBox.onTextChanged = () => {
            // Override the existing function to have dynamic onTextChanged function
            if (materialTextBox.rightLayout && materialTextBox.rightLayout.view) {
                materialTextBox.rightLayout.view.visible = !!materialTextBox.text;
            }
            textChanged && textChanged.call(materialTextBox);
        }
    }

    changeOnEditBeginsFunction = () => {
        const { materialTextBox } = this;
        let editBegins = materialTextBox.onEditBegins;
        materialTextBox.onEditBegins = () => {
            // Override the existing function to have dynamic onTextChanged function
            if (materialTextBox.rightLayout && materialTextBox.rightLayout.view) {
                materialTextBox.rightLayout.view.visible = !!materialTextBox.text;
            }
            editBegins && editBegins.call(materialTextBox);
        }
    }

    changeOnEditEndsFunction = () => {
        const { materialTextBox } = this;
        let editEnds = materialTextBox.onEditEnds;
        materialTextBox.onEditEnds =  () => {
            // Override the existing function to have dynamic onTextChanged function
            if (materialTextBox.rightLayout && materialTextBox.rightLayout.view) {
                materialTextBox.rightLayout.view.visible = false;
            }
            if (this._trim) {
                materialTextBox.text = this.removeWhiteSpaces(materialTextBox.text || "");
                materialTextBox.onTextChanged();
            }
            editEnds && editEnds.call(materialTextBox);
        }
    }

    createRightLayout = (component: any, RightLayoutTemplate: any, visible: any) => {
        component.rightLayout = new FlexLayout();
        component.rightLabel = new Label();
        const { materialTextBox, rightLayout, rightLabel } = component;
        if (!(materialTextBox instanceof MaterialTextBox)) return;
        componentContextPatch(rightLayout, "mtbRightLayout"); // TODO: use $$styleContext
        rightLayout.dispatch({
            type: "pushClassNames",
            classNames: [".materialTextBox-rightLayout"]
        });
        rightLayout.addChild(rightLabel, "mtbRightLabel", ".materialTextBox-rightLayout-rightLabel");
        this.initRightLayout(component, RightLayoutTemplate, visible);
    }

    initRightLayout = (component: any, RightLayoutTemplate: any, visible: any) => {
        const { materialTextBox, rightLayout, rightLabel } = component;
        //@ts-ignore
        let showTitle = global.lang.show || "SHOW";
        //@ts-ignore
        let hideTitle = global.lang.hide || "HIDE";
        //@ts-ignore
        let clearAll = global.lang.clearAll || "CLEAR ALL";
        let rightLayoutWidth = 0;
        this.setVisibility(rightLayout, visible);
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

    setVisibility = (component: any, visible: any) => {
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

    createMaterialTextBox = (options: any) => {
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
        //@ts-ignore
        Object.keys(purifiedIOS).forEach(key => materialTextBox.ios[key] = purifiedIOS[key]);
        //@ts-ignore
        Object.keys(purifiedAndroid).forEach(key => materialTextBox.android[key] = purifiedAndroid[key]);
        return materialTextBox;
    }

    initMaterialTextBox = (materialTextBox: MaterialTextBox, className = "") => {
        const materialClassName = `.materialTextBox${className}`;
        const testId = this.materialTextBox.testId;
        this.materialTextBox = materialTextBox;
        if (testId) {
            this.materialTextBox.testId = testId;
        }
        materialTextBox.onTextChanged = materialTextBox.onTextChanged || function () {
            //@ts-ignore
            this.errorMessage = "";
        }.bind(materialTextBox);
        materialTextBox.onTouchMoved = materialTextBox.onTouchMoved || function () {
            //@ts-ignore
            this.getParent().android.requestDisallowInterceptTouchEvent(false);
            return false;
        }.bind(materialTextBox);
        this.removeAll();
        //@ts-ignore
        this.addChild(materialTextBox, "materialTextBox", materialClassName, userProps => {
            if (wrapperHeight) {
                userProps.height = userProps.height || wrapperHeight;
            }
            return userProps;
        });
        this.changeOnEditEndsFunction.call(this);
    }

    removeWhiteSpaces(text: string) {
        const pattern = { startsWithWhiteSpace: /^\s+|\s+$/g, moreThanOneWhitespaceBetweenWords: /\s\s+/g };
        return text.replace(pattern.startsWithWhiteSpace, "").replace(pattern.moreThanOneWhitespaceBetweenWords, " ");
    }
    
}

