import { DEPENDENCY } from '../../common/constants';
import { useDependency } from './useDependency';
import { FormatService } from '../../common/services/FormatService';

export const useFormatter = (): FormatService => {
  const formatter = useDependency(DEPENDENCY.FORMAT_SERVICE) as FormatService;
  return formatter;
};
