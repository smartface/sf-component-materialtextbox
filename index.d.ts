import FlexLayout = require('@smartface/native/ui/flexlayout');
import MaterialTextBox = require('@smartface/native/ui/materialtextbox');
export = FlMaterialTextBox;
declare class FlMaterialTextBox extends FlexLayout {
    set onDropDownClick(onTouchEnded: (isInside?: boolean) => void);
    enableDropDown: boolean;
    showHideEnabled: boolean;
    clearAllEnabled: boolean;
    options: Partial<MaterialTextBox> & { ios?: Partial<typeof MaterialTextBox.ios>, android?: Partial<typeof MaterialTextBox.android>, className?: string };
    materialTextBox: MaterialTextBox;
    /**
     * @default true
     */
    trim: boolean;
}
