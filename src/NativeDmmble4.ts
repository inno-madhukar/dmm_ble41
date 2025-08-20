import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
 readCsv(): Promise<string[][]>; // each row is an ar
}

export default TurboModuleRegistry.getEnforcing<Spec>('Dmmble4');
