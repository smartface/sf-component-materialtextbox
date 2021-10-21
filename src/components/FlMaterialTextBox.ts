import System from "@smartface/native/device/system";
import Screen from "@smartface/native/device/screen";
import FlMaterialTextBoxDesign from "../generated/FlMaterialTextBox";
import Label from "@smartface/native/ui/label";
import FlexLayout from "@smartface/native/ui/flexlayout";
import MaterialTextBox from "@smartface/native/ui/materialtextbox";
import { getCombinedStyle } from "@smartface/extension-utils/lib/getCombinedStyle";
import componentContextPatch from "@smartface/contx/lib/smartface/componentContextPatch";
import View from "@smartface/native/ui/view";
const { height: wrapperHeight } = getCombinedStyle(".materialTextBox-wrapper");
enum RightLayouts {
    SHOW_HIDE,
    CLEAR_ALL
};

type OptionType = Partial<MaterialTextBox> & { ios?: Partial<MaterialTextBox["ios"]>, android?: Partial<MaterialTextBox["android"]>, className?: string };

export default class FlMaterialTextBox extends FlMaterialTextBoxDesign {
    //@ts-ignore
    private _materialTextBox: MaterialTextBox = { ios: {}, android: {} };
    pageName?: string;
    private _arrowVisibility = false;
    private _showHideEnabled = false;
    private _clearAllEnabled = false;
    private _dropDownClick = false;
    private _options: OptionType = {};
    private _trim = true;
    private rightLayout = new FlexLayout();
    private rightLabel = new Label();
    constructor(props?: ConstructorParameters<typeof FlexLayout>, pageName?: string) {
        super(props);
        this.pageName = pageName;
    }

    get enableDropDown(): boolean {
        return this._arrowVisibility;
    }

    get materialTextBox(): MaterialTextBox {
        return this._materialTextBox;
    }

    private set materialTextBox(value: MaterialTextBox) {
        this._materialTextBox = value;
    }

    set enableDropDown(value: boolean) {
        this._arrowVisibility = value;
        this.setVisibility(this.imgDropDown, value);
        this.materialTextBox.ios.clearButtonEnabled = !this._arrowVisibility;
    }

    set onDropDownClick(value: FlexLayout['onTouchEnded']) {
        this._dropDownClick = typeof value === "function";
        if (System.OS === System.OSType.IOS) {
            this.onTouchEnded = (isInside: boolean) => this._dropDownClick && value(isInside, {});
            this.materialTextBox.touchEnabled = !this._dropDownClick;
        }
        else {
            if (this._dropDownClick) {
                this.android.onInterceptTouchEvent = () => { return true; };
                this.onTouchEnded = (isInside: boolean) => {
                    this._dropDownClick && value(isInside, {});
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
            !this._showHideEnabled && this.createRightLayout(this, RightLayouts.SHOW_HIDE, false);
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
            !this._clearAllEnabled && this.createRightLayout(this, RightLayouts.CLEAR_ALL, false);
            this.changeOnTextChangedFunction.call(this);
            this.changeOnEditBeginsFunction.call(this);
            this.changeOnEditEndsFunction.call(this);
            this._clearAllEnabled = value;
        }
    }

    get trim(): boolean {
        return this._trim;
    }

    set trim(value: boolean) {
        this._trim = value;
    }

    get options(): OptionType {
        return this._options;
    }

    set options(properties: OptionType) {
        const materialTextBox = this.createMaterialTextBox(properties);
        this.initMaterialTextBox(materialTextBox, properties.className);
        this._options = properties;
    }

    private changeOnTextChangedFunction() {
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

    private changeOnEditBeginsFunction() {
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

    private changeOnEditEndsFunction() {
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

    private createRightLayout(component: FlMaterialTextBox, RightLayoutTemplate: RightLayouts, visible: boolean) {
        if (!(component.materialTextBox instanceof MaterialTextBox)) return;
        componentContextPatch(component.rightLayout, "mtbRightLayout"); // TODO: use $$styleContext
        //@ts-ignore
        component.rightLayout.dispatch({
            type: "pushClassNames",
            classNames: [".materialTextBox-rightLayout"]
        });
        //@ts-ignore
        component.rightLayout.addChild(component.rightLabel, "mtbRightLabel", ".materialTextBox-rightLayout-rightLabel");
        this.initRightLayout(component, RightLayoutTemplate, visible);
    }

    private initRightLayout(component: FlMaterialTextBox, RightLayoutTemplate: RightLayouts, visible: boolean) {
        //@ts-ignore
        let showTitle = global.lang.show || "SHOW";
        //@ts-ignore
        let hideTitle = global.lang.hide || "HIDE";
        //@ts-ignore
        let clearAll = global.lang.clearAll || "CLEAR ALL";
        let rightLayoutWidth = 0;
        //@ts-ignore
        this.setVisibility(component.rightLayout, visible);
        switch (RightLayoutTemplate) {
            case RightLayouts.SHOW_HIDE: { // SHOWHIDE
                component.rightLabel.text = showTitle;
                let showWidth = component.rightLabel.font.sizeOfString(showTitle, Screen.width / 2).width;
                let hideWidth = component.rightLabel.font.sizeOfString(hideTitle, Screen.width / 2).width;
                rightLayoutWidth = Math.max(showWidth, hideWidth);
                component.rightLayout.onTouchEnded = () => {
                    let { isPassword, cursorPosition } = component.materialTextBox;
                    component.rightLabel.text = isPassword ? hideTitle : showTitle;
                    component.materialTextBox.isPassword = !isPassword;
                    component.materialTextBox.cursorPosition = cursorPosition; // Android workaround for cursor moving around
                };
                break;
            }
            case RightLayouts.CLEAR_ALL: // CLEARALL
            component.rightLabel.text = clearAll;
                rightLayoutWidth = component.rightLabel.font.sizeOfString(component.rightLabel.text, Screen.width / 2).width;
                component.rightLayout.onTouchEnded = () => {
                    component.materialTextBox.text = "";
                    component.materialTextBox.onTextChanged();
                    component.materialTextBox.errorMessage = "";
                    component.rightLayout.visible = false;
                };
                break;
            default:
                return;
        }
        component.materialTextBox.rightLayout = {
            view: component.rightLayout,
            width: rightLayoutWidth + 10 // Seems like sizeOfString is not enough to cut it, add a buffer.
        };
    }

    setVisibility(component: StyleContextComponentType<View>, visible: boolean) {
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

    createMaterialTextBox(options: OptionType) {
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
        //@ts-ignore
        delete purifiedOptions.ios;
        //@ts-ignore
        delete purifiedOptions.android;
        let materialTextBox = new MaterialTextBox(purifiedOptions);
        //@ts-ignore
        Object.keys(purifiedIOS).forEach(key => materialTextBox.ios[key] = purifiedIOS[key]);
        //@ts-ignore
        Object.keys(purifiedAndroid).forEach(key => materialTextBox.android[key] = purifiedAndroid[key]);
        return materialTextBox;
    }

    initMaterialTextBox(materialTextBox: MaterialTextBox, className = "") {
        const materialClassName = `.materialTextBox${className}`;
        const testId = this.materialTextBox?.testId || '';
        if (testId) {
            materialTextBox.testId = testId;
        }
        this.materialTextBox = materialTextBox;

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

