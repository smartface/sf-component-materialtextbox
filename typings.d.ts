type StyleContextDispatch = {
    dispatch: (action: { [key: string]: any }) => void;
}
type StyleContextAddChild = {
    addChild(child: View, name?: string, classNames?: string, userProps?: { [key: string]: any; }, defaultClassNames?: string): void;
}
type StyleContextComponent = StyleContextAddChild & StyleContextDispatch;
type StyleContextComponentType<T> = T & StyleContextAddChild & StyleContextDispatch;
type StyleContextComponentWithDispatch<T> = T & StyleContextDispatch;
type componentContextPatch = <T = any>(component: T, name: string) => StyleContextComponentType<T>;
