import { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  multiply1(a: number, b: number): number; // sync method
  createFolder(path:string): Promise<string>; // async method returning Promise
}

export default TurboModuleRegistry.getEnforcing<Spec>('Dmm_ble4');
