//------------------------------------------------------------------------------
//
//     This code was auto generated.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
//
//------------------------------------------------------------------------------

const extend = require('js-base/core/extend');
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

// Constructor
function FlMaterialTextBox(_super, props) {
  // Initalizes super class for this component scope

  _super(this, Object.assign({
    skipDefaults: true
  }, props));
  addChild.call(this, "imgDropDown", $FlMaterialTextBox$$ImgDropDown_, this);
}
FlMaterialTextBox.$$styleContext = {
  classNames: ".flexLayout .materialTextBox-wrapper",
  userProps: {}
};
const FlMaterialTextBox_ = FlexLayout(FlMaterialTextBox);

function $FlMaterialTextBox$$ImgDropDown(_super, pageInstance) {
  _super(this, {
    skipDefaults: true
  });
  pageInstance.imgDropDown = this;
}
$FlMaterialTextBox$$ImgDropDown.$$styleContext = {
  classNames: ".imageView .materialTextBox-wrapper-dropArrow.hidden",
  userProps: {}
};
const $FlMaterialTextBox$$ImgDropDown_ = ImageView($FlMaterialTextBox$$ImgDropDown);

module.exports = FlMaterialTextBox_;