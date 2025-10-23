// Simple logging - no need to overcomplicate this
export const logger = {
  debug: (_msg: string, _data?: any) => {
    // Debug logging disabled
  },
  
  info: (_msg: string, _data?: any) => {
    // Info logging disabled
  },
  
  warn: (msg: string, data?: any) => {
    console.warn(`[WARN] ${msg}`, data || '');
  },
  
  error: (msg: string, data?: any) => {
    console.error(`[ERROR] ${msg}`, data || '');
  },
  
  // Keep some of the specialized ones but make them simpler
  apiCall: (_method: string, _url: string, _data?: any) => {
    // API call logging disabled
  },
  
  apiSuccess: (_method: string, _url: string, _response?: any) => {
    // API success logging disabled
  },
  
  apiError: (method: string, url: string, error: any) => {
    console.error(`API Error: ${method} ${url}`, error);
  },
  
  authEvent: (_event: string, _data?: any) => {
    // Auth event logging disabled
  },
  
  cartEvent: (_event: string, _data?: any) => {
    // Cart event logging disabled
  }
};
