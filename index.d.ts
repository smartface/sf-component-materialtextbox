import FlexLayout = require('sf-core/ui/flexlayout');
import MaterialTextBox = require('sf-core/ui/materialtextbox');
export = FlMaterialTextBox;
declare class FlMaterialTextBox extends FlexLayout {
    set onDropDownClick(onTouchEnded: (isInside?: boolean) => void);
    enableDropDown: boolean;
    showHideEnabled: boolean;
    clearAllEnabled: boolean;
    options: Partial<MaterialTextBox> & { ios?: Partial<typeof MaterialTextBox.ios>, android?: Partial<typeof MaterialTextBox.android> };
    materialTextBox: MaterialTextBox;
    /**
     * @default true
     */
    trim: boolean;
}
