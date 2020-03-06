import View = require('sf-core/ui/view');
export = MaterialBox;
// TODO: Detail of class MaterialTextBox
declare type MaterialTextBox = any;
declare class MaterialBox extends View {
    set onDropDownClick(onTouchEnded: () => void): void;
    showHideEnabled: boolean;
    clearAllEnabled: boolean;
    options: any;
    materialTextBox: MaterialTextBox;
}