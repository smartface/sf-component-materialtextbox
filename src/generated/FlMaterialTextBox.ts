//------------------------------------------------------------------------------
//
//     This code was auto generated.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
//
//------------------------------------------------------------------------------
import { Styleable } from 'generated/core/Styleable';
import View = require('@smartface/native/ui/view');
import { ComponentStyleContext } from '@smartface/styling-context/lib/ComponentStyleContext';
import { extendOfViewGroup } from '@smartface/styling-context/lib/extendOfViewGroup';
import { styleableComponentMixin, styleableContainerComponentMixin } from '@smartface/styling-context/lib/styleableComponentMixin';
import System = require('@smartface/native/device/system');

import FlexLayout = require('@smartface/native/ui/flexlayout');
import ImageView = require('@smartface/native/ui/imageview');

interface MaterialtextboxChildren {
  imgDropDown?: $Materialtextbox$$ImgDropDown;
  [key: string]: any;
}

export default class Materialtextbox extends styleableContainerComponentMixin(FlexLayout) {
  protected _children: MaterialtextboxChildren = {};
  get children(): Readonly<MaterialtextboxChildren> {
    return this._children;
  }
  static $$styleContext: ComponentStyleContext = {
    classNames: '.materialTextBox-wrapper',
    defaultClassNames: '.default_common .default_flexLayout',
    userProps: {}
  };
  imgDropDown: $Materialtextbox$$ImgDropDown;
  constructor(props?: any) {
    super(props);

    this.addChildByName(new $Materialtextbox$$ImgDropDown(), 'imgDropDown');
    this.imgDropDown = this.children.imgDropDown;

    this.testId = '___library___Materialtextbox';
  }

  /**
   * @deprecated The method should not be used
   */
  addChildByName(child: View<any>, name: string) {
    this._children[name] = child;
    this.addStyleableChild(child, name);
    this.addChild(child);
  }
  addChild(child: View<any>, name?: string, classNames?: string, userProps?: { [key: string]: any }, defaultClassNames?: string): void {
    if (this['layout']) {
      this['layout'].addChild(child);
    } else {
      super.addChild(child);
    }
    if (name) {
      this.addStyleableChild(child, name, classNames, userProps, defaultClassNames);
    }
  }

  applyTestIDs(testId: string) {
    Object.keys(this._children).forEach(child => {
      this._children[child].testId = testId + '_' + child.charAt(0).toUpperCase() + child.slice(1);
      if (this._children[child].applyTestIDs) {
        this._children[child].applyTestIDs(this._children[child].testId);
      }
    });
  }
}

class $Materialtextbox$$ImgDropDown extends styleableComponentMixin(ImageView) {
  static $$styleContext: ComponentStyleContext = {
    classNames: '.materialTextBox-wrapper-dropArrow.hidden',
    defaultClassNames: '.default_common .default_imageView',
    userProps: {}
  };
  constructor(props?: any) {
    super(props);

    this.testId = '___library___Materialtextbox_ImgDropDown';
  }
}
