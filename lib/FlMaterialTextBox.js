//------------------------------------------------------------------------------
//
//     This code was auto generated.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
//
//------------------------------------------------------------------------------

const FlexLayout = extend(require('sf-core/ui/flexlayout'));
const ImageView = extend(require('sf-core/ui/imageview'));

function addChild(childName, ChildClass, componentInstance) {
  this.children = this.children || {};
  this.children[childName] = new ChildClass(componentInstance);
  if (this.layout)
    this.layout.addChild(this.children[childName]);
  else
    this.addChild(this.children[childName]);
}
FlMaterialTextBox.prototype = Object.create(FlexLayout.prototype);
// Constructor
function FlMaterialTextBox(props) {
  // Initalizes super class for this component scope
  FlexLayout.call(this, Object.assign({
    skipDefaults: true
  }, props))
  addChild.call(this, "imgDropDown", $FlMaterialTextBox$$ImgDropDown, this);
}
FlMaterialTextBox.$$styleContext = {
  classNames: ".flexLayout .materialTextBox-wrapper",
  userProps: {}
};

$FlMaterialTextBox$$ImgDropDown.prototype = Object.create(ImageView.prototype);

function $FlMaterialTextBox$$ImgDropDown(pageInstance) {
  ImageView.call(this, {
    skipDefaults: true
  });
  pageInstance.imgDropDown = this;
}
$FlMaterialTextBox$$ImgDropDown.$$styleContext = {
  classNames: ".imageView .materialTextBox-wrapper-dropArrow.hidden",
  userProps: {}
};

module.exports = FlMaterialTextBox;