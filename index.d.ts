import FlexLayout = require('sf-core/ui/flexlayout');
import MaterialTextBox = require('sf-core/ui/materialtextbox');
export = FlMaterialTextBox;
declare class FlMaterialTextBox extends FlexLayout {
    set onDropDownClick(onTouchEnded: () => void): void;
    enableDropDown: boolean;
    showHideEnabled: boolean;
    clearAllEnabled: boolean;
    options: Object;
    materialTextBox: MaterialTextBox;
}
