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
import { ComponentStyleContext } from 'generated/core/ComponentStyleContext';
import System = require('@smartface/native/device/system');

import FlexLayout = require('@smartface/native/ui/flexlayout');
import ImageView = require('@smartface/native/ui/imageview');

export default class Materialtextbox extends FlexLayout implements Styleable {
	dispatch: (action: { [key: string]: any }) => void;
	children: { [key: string]: any } = {};
	static $$styleContext: ComponentStyleContext = {
		classNames: '.materialTextBox-wrapper',
		defaultClassNames: '.default_common .default_flexLayout',
		userProps: { testId: '___library___Materialtextbox' }
	};
	imgDropDown: StyleContextComponentType<$Materialtextbox$$ImgDropDown>;
	constructor(props?: ConstructorParameters<typeof FlexLayout>) {
		super();

		this.addChildByName(new $Materialtextbox$$ImgDropDown(), 'imgDropDown');
		this.imgDropDown = this.children.imgDropDown;
	}
	addChildByName(child: View, name: string) {
		this.children[name] = child;
		this.addChild(child);
	}
	addChild(child: View, name?: string, classNames?: string, userProps?: { [key: string]: any }, defaultClassNames?: string): void {
		if (this['layout']) {
			this['layout'].addChild(child);
		} else {
			super.addChild(child);
		}
	}
}

class $Materialtextbox$$ImgDropDown extends ImageView implements Styleable {
	dispatch: (action: { [key: string]: any }) => void;
	static $$styleContext: ComponentStyleContext = {
		classNames: '.materialTextBox-wrapper-dropArrow.hidden',
		defaultClassNames: '.default_common .default_imageView',
		userProps: { testId: '___library___Materialtextbox_ImgDropDown' }
	};
	constructor() {
		super();
	}
}
