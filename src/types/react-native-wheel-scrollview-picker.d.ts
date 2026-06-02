declare module 'react-native-wheel-scrollview-picker' {
  import type { ReactNode } from 'react';
  import type { ScrollViewProps, TextStyle, ViewProps } from 'react-native';

  export type ScrollPickerProps<ItemT extends string | number> = {
    activeItemTextStyle?: TextStyle;
    dataSource: ItemT[];
    highlightBorderWidth?: number;
    highlightColor?: string;
    itemHeight?: number;
    itemTextStyle?: TextStyle;
    onValueChange?: (value: ItemT | undefined, index: number) => void;
    selectedIndex?: number;
    style?: ViewProps['style'];
    wrapperBackground?: string;
    wrapperHeight?: number;
  } & ScrollViewProps;

  export default function ScrollPicker<ItemT extends string | number>(
    props: ScrollPickerProps<ItemT>,
  ): ReactNode;
}
