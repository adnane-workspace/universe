import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';

export type SymbolName = { ios: SFSymbol; android: AndroidSymbol };

export function Icon({ name, color, size = 20 }: { name: SymbolName; color: string; size?: number }) {
  return <SymbolView name={{ ios: name.ios, android: name.android, web: name.android }} tintColor={color} size={size} />;
}
