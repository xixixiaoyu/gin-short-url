import { 
  dateUtils, 
  numberUtils, 
  urlUtils, 
  clipboardUtils,
  debounce,
  throttle,
  generateId,
  storageUtils 
} from '@/utils';

// Mock Date for consistent testing
const mockDate = new Date('2023-01-01T12:00:00Z');
jest.useFakeTimers().setSystemTime(mockDate);

describe('Utils', () => {
  describe('dateUtils', () => {
    it('formats relative time correctly', () => {
      const pastDate = new Date('2023-01-01T10:00:00Z');
      const result = dateUtils.formatRelative(pastDate);
      expect(result).toContain('ago');
    });

    it('formats absolute time correctly', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      const result = dateUtils.formatAbsolute(date, 'yyyy-MM-dd');
      expect(result).toBe('2023-01-01');
    });

    it('formats date time correctly', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      const result = dateUtils.formatDateTime(date);
      expect(result).toMatch(/Jan 01, 2023/);
    });
  });

  describe('numberUtils', () => {
    it('formats large numbers correctly', () => {
      expect(numberUtils.formatLarge(500)).toBe('500');
      expect(numberUtils.formatLarge(1500)).toBe('1.5K');
      expect(numberUtils.formatLarge(1500000)).toBe('1.5M');
    });

    it('formats percentage correctly', () => {
      expect(numberUtils.formatPercentage(25, 100)).toBe('25.0%');
      expect(numberUtils.formatPercentage(0, 0)).toBe('0%');
    });

    it('formats bytes correctly', () => {
      expect(numberUtils.formatBytes(0)).toBe('0 B');
      expect(numberUtils.formatBytes(1024)).toBe('1 KB');
      expect(numberUtils.formatBytes(1048576)).toBe('1 MB');
    });
  });

  describe('urlUtils', () => {
    it('extracts domain correctly', () => {
      expect(urlUtils.extractDomain('https://www.example.com/path')).toBe('www.example.com');
      expect(urlUtils.extractDomain('example.com')).toBe('example.com');
    });

    it('truncates URL correctly', () => {
      const longUrl = 'https://www.example.com/very/long/path/that/should/be/truncated';
      const result = urlUtils.truncateURL(longUrl, 30);
      expect(result).toHaveLength(30);
      expect(result).toEndWith('...');
    });

    it('validates URL correctly', () => {
      expect(urlUtils.isValidURL('https://www.example.com')).toBe(true);
      expect(urlUtils.isValidURL('www.example.com')).toBe(true);
      expect(urlUtils.isValidURL('invalid-url')).toBe(false);
    });
  });

  describe('clipboardUtils', () => {
    beforeEach(() => {
      // Reset clipboard mock
      (navigator.clipboard.writeText as jest.Mock).mockClear();
    });

    it('copies text successfully', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockResolvedValue(undefined);
      
      const result = await clipboardUtils.copy('test text');
      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
    });

    it('handles copy failure', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValue(new Error('Failed'));
      
      const result = await clipboardUtils.copy('test text');
      expect(result).toBe(false);
    });

    it('checks clipboard support', () => {
      expect(clipboardUtils.isSupported()).toBe(true);
    });
  });

  describe('debounce', () => {
    it('debounces function calls', () => {
      jest.useFakeTimers();
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });
  });

  describe('throttle', () => {
    it('throttles function calls', () => {
      jest.useFakeTimers();
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });
  });

  describe('generateId', () => {
    it('generates ID with default length', () => {
      const id = generateId();
      expect(id).toHaveLength(8);
      expect(id).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('generates ID with custom length', () => {
      const id = generateId(12);
      expect(id).toHaveLength(12);
    });
  });

  describe('storageUtils', () => {
    beforeEach(() => {
      localStorage.clear();
      (localStorage.getItem as jest.Mock).mockClear();
      (localStorage.setItem as jest.Mock).mockClear();
      (localStorage.removeItem as jest.Mock).mockClear();
    });

    it('gets item from localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('{"test": "value"}');
      
      const result = storageUtils.get('test-key');
      expect(result).toEqual({ test: 'value' });
      expect(localStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('sets item to localStorage', () => {
      const testData = { test: 'value' };
      storageUtils.set('test-key', testData);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testData));
    });

    it('removes item from localStorage', () => {
      storageUtils.remove('test-key');
      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('clears localStorage', () => {
      storageUtils.clear();
      expect(localStorage.clear).toHaveBeenCalled();
    });

    it('handles JSON parse errors gracefully', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('invalid-json');
      
      const result = storageUtils.get('test-key', 'default');
      expect(result).toBe('default');
    });
  });
});
