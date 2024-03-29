import System from "@smartface/native/device/system";
import Screen from "@smartface/native/device/screen";
import FlMaterialTextBoxDesign from "../generated/FlMaterialTextBox";
import Label from "@smartface/native/ui/label";
import FlexLayout from "@smartface/native/ui/flexlayout";
import MaterialTextBox from "@smartface/native/ui/materialtextbox";
import { ThemeService, StyleContextComponentType } from "@smartface/styling-context";
import View from "@smartface/native/ui/view";
const { height: wrapperHeight } = ThemeService.instance.getStyle(".materialTextBox-wrapper");
enum RightLayouts {
	SHOW_HIDE,
	CLEAR_ALL,
}

type OptionType = Partial<MaterialTextBox> & { ios?: Partial<MaterialTextBox["ios"]>; android?: Partial<MaterialTextBox["android"]>; className?: string };

export default class FlMaterialTextBox extends FlMaterialTextBoxDesign {
	//@ts-ignore
	private _materialTextBox: MaterialTextBox = { ios: {}, android: {} };
	pageName?: string;
	private _arrowVisibility = false;
	private _showHideEnabled = false;
	private _clearAllEnabled = false;
	private _dropDownClick = false;
	private _onRightLayoutClick?: () => void;
	private _options: OptionType = {};
	private _trim = true;
	private _showTitle = "SHOW";
	private _hideTitle = "HIDE";
	private _clearAllTitle = "CLEAR ALL";
	private rightLabel!: StyleContextComponentType<Label>;
	private rightLayout!: StyleContextComponentType<FlexLayout>;
	private rightLayoutGuid = guid();
	private rightLabelGuid = guid();
	constructor(props?: ConstructorParameters<typeof FlexLayout>, pageName?: string) {
		super(props);
		this.pageName = pageName;
	}

	get showTitle(): string {
		return this._showTitle;
	}

	set showTitle(value: string) {
		this._showTitle = value;
	}

	get hideTitle(): string {
		return this._hideTitle;
	}

	set hideTitle(value: string) {
		this._hideTitle = value;
	}

	get clearAllTitle(): string {
		return this._clearAllTitle;
	}

	set clearAllTitle(value: string) {
		this._clearAllTitle = value;
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

	set onDropDownClick(value: View["onTouchEnded"]) {
		this._dropDownClick = typeof value === "function";
		if (System.OS === System.OSType.IOS) {
			this.onTouchEnded = (isInside: boolean) => this._dropDownClick && value(isInside, {});
			this.materialTextBox.touchEnabled = !this._dropDownClick;
		} else {
			if (this._dropDownClick) {
				this.android.onInterceptTouchEvent = () => {
					return true;
				};
				this.onTouchEnded = (isInside: boolean) => {
					this._dropDownClick && value(isInside, {});
					return this._dropDownClick;
				};
			} else {
				this.android.onInterceptTouchEvent = null;
			}
		}
	}

	set onRightLayoutClick(value: () => void) {
		this._onRightLayoutClick = typeof value === "function" ? value : () => {};
	}

	get showHideEnabled(): boolean {
		return this._showHideEnabled;
	}

	set showHideEnabled(value: boolean) {
		if (!(this.materialTextBox instanceof MaterialTextBox)) {
			console.error("Attempting to set showHideEnabled value without initializing materialTextBox.");
			return;
		}
		this.initRightLayout(RightLayouts.SHOW_HIDE, value);
		this._showHideEnabled = value;
	}

	get clearAllEnabled(): boolean {
		return this._clearAllEnabled;
	}

	set clearAllEnabled(value: boolean) {
		if (!(this.materialTextBox instanceof MaterialTextBox)) {
			console.error("Attempting to set clearAllEnabled value without initializing materialTextBox.");
			return;
		}
		this.initRightLayout(RightLayouts.CLEAR_ALL, value);
		this._clearAllEnabled = value;
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

	private initRightLayout(template: RightLayouts, toggle: boolean) {
		this.materialTextBox.ios.clearButtonEnabled = !toggle;
		this.createRightLayout();
		this.setRightLayoutTemplate(template);
		this.setVisibility(this.materialTextBox.rightLayout.view, false);
	}

	private changeOnTextChangedFunction() {
		const textChanged = this.materialTextBox.onTextChanged;
		this.materialTextBox.onTextChanged = () => {
			// Override the existing function to have dynamic onTextChanged function
			if (this.materialTextBox.rightLayout?.view) {
				this.setVisibility(this.materialTextBox.rightLayout.view, !!this.materialTextBox.text);
			}
			textChanged && textChanged.call(this.materialTextBox);
		};
	}

	private changeOnEditBeginsFunction() {
		const editBegins = this.materialTextBox.onEditBegins;
		this.materialTextBox.onEditBegins = () => {
			// Override the existing function to have dynamic onTextChanged function
			if (this.materialTextBox.rightLayout?.view) {
				this.setVisibility(this.materialTextBox.rightLayout.view, !!this.materialTextBox.text);
			}
			editBegins && editBegins.call(this.materialTextBox);
		};
	}

	private changeOnEditEndsFunction() {
		const editEnds = this.materialTextBox.onEditEnds;
		this.materialTextBox.onEditEnds = () => {
			// Override the existing function to have dynamic onTextChanged function
			if (this._trim) {
				this.materialTextBox.text = this.removeWhiteSpaces(this.materialTextBox.text || "");
				this.materialTextBox.onTextChanged();
			}
			if (this.materialTextBox.rightLayout?.view) {
				this.setVisibility(this.materialTextBox.rightLayout.view, false);
			}
			editEnds && editEnds.call(this.materialTextBox);
		};
	}

	private createRightLayout() {
		this.rightLayout = new FlexLayout() as StyleContextComponentType<FlexLayout>;
		this.rightLabel = new Label() as StyleContextComponentType<Label>;
		ThemeService.instance.addGlobalComponent(this.rightLayout as any, `mtbRightLayout-${this.rightLayoutGuid}`);
		this.rightLayout.dispatch?.({
			type: "pushClassNames",
			classNames: [".materialTextBox-rightLayout"],
		});
		this.rightLayout.addChild(this.rightLabel);
		ThemeService.instance.addGlobalComponent(this.rightLabel as any, `mtbrightLabel-${this.rightLabelGuid}`);
		this.rightLabel.dispatch?.({
			type: "pushClassNames",
			classNames: [".materialTextBox-rightLayout-rightLabel"],
		});
		return this.rightLayout;
	}

	private setRightLayoutTemplate(RightLayoutTemplate: RightLayouts) {
		const showTitle = this._showTitle || "SHOW";
		const hideTitle = this._hideTitle || "HIDE";
		const clearAll = this._clearAllTitle || "CLEAR ALL";
		let rightLayoutWidth = 0;
		switch (RightLayoutTemplate) {
			case RightLayouts.SHOW_HIDE: {
				this.rightLabel.text = showTitle;
				const showWidth = this.rightLabel.font.sizeOfString(showTitle, Screen.width / 2).width;
				const hideWidth = this.rightLabel.font.sizeOfString(hideTitle, Screen.width / 2).width;
				rightLayoutWidth = Math.max(showWidth, hideWidth);
				this.rightLayout.onTouchEnded = () => {
					const { isPassword, cursorPosition } = this.materialTextBox;
					this.rightLabel.text = isPassword ? hideTitle : showTitle;
					this.materialTextBox.isPassword = !isPassword;
					this.materialTextBox.cursorPosition = cursorPosition; // Android workaround for cursor moving around
					typeof this._onRightLayoutClick === "function" && this._onRightLayoutClick();
					return false;
				};
				break;
			}
			case RightLayouts.CLEAR_ALL: {
				this.rightLabel.text = clearAll;
				rightLayoutWidth = this.rightLabel.font.sizeOfString(this.rightLabel.text, Screen.width / 2).width;
				this.rightLayout.onTouchEnded = () => {
					this.materialTextBox.text = "";
					this.materialTextBox.onTextChanged();
					this.materialTextBox.errorMessage = "";
					this.setVisibility(this.rightLayout, false);
					typeof this._onRightLayoutClick === "function" && this._onRightLayoutClick();
					return false;
				};
				break;
			}
			default: {
				return;
			}
		}
		this.materialTextBox.rightLayout = {
			view: this.rightLayout,
			width: rightLayoutWidth + 10, // Seems like sizeOfString is not enough to cut it, add a buffer.
		};
		this.changeOnTextChangedFunction();
		this.changeOnEditBeginsFunction();
		this.changeOnEditEndsFunction();
	}

	setVisibility(component: StyleContextComponentType<View>, visible: boolean) {
		if (typeof component.dispatch === "function") {
			component.dispatch({
				type: "updateUserStyle",
				userStyle: {
					visible,
				},
			});
		} else {
			component.visible = visible;
		}
	}

	createMaterialTextBox(options: OptionType) {
		let defaults = {
			// Other defaults can be found in materialTextBox.json
			ios: {
				clearButtonEnabled: false,
			},
			android: {
				enableErrorMessage: true,
			},
		};
		let purifiedOptions = Object.assign({}, defaults, options);
		let purifiedIOS = Object.assign({}, defaults.ios, options.ios || {});
		let purifiedAndroid = Object.assign({}, defaults.android, options.android || {});
		delete purifiedOptions.ios;
		delete purifiedOptions.android;
		let materialTextBox = new MaterialTextBox(purifiedOptions);
		Object.keys(purifiedIOS).forEach((key) => (materialTextBox.ios[key] = purifiedIOS[key]));
		Object.keys(purifiedAndroid).forEach((key) => (materialTextBox.android[key] = purifiedAndroid[key]));
		return materialTextBox;
	}

	initMaterialTextBox(materialTextBox: MaterialTextBox, className = "") {
		const materialClassName = `.materialTextBox${className}`;
		const testId = this.materialTextBox?.testId || "";
		if (testId) {
			materialTextBox.testId = testId;
		}
		this.materialTextBox = materialTextBox;

		materialTextBox.onTextChanged =
			materialTextBox.onTextChanged ||
			function (this: MaterialTextBox) {
				this.errorMessage = "";
			}.bind(materialTextBox);
		materialTextBox.onTouchMoved =
			materialTextBox.onTouchMoved ||
			function (this: MaterialTextBox) {
				//@ts-ignore - Add requestDisallowInterceptTouchEvent to ViewGroup
				this.getParent().android.requestDisallowInterceptTouchEvent(false);
				return false;
			}.bind(materialTextBox);
		this.removeAll();
		this.addChild(materialTextBox);
		this.addStyleableChild(materialTextBox, "materialTextBox", materialClassName, (userProps: Record<string, any>) => {
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

function guid(): string {
	return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

function s4() {
	return Math.floor((1 + Math.random()) * 0x10000)
		.toString(16)
		.substring(1);
}

// scripts/generated/pages/page1/index.ts(63,25): error TS2345: Argument of type '$MaterialTextBox' is not assignable to parameter of type 'View<any>'.
//   Property 'emitter' is protected but type 'View<TEvent>' is not a class derived from 'View<TEvent>'.

// 4:56:05 PM - Found 1 error. Watching for file changes.
