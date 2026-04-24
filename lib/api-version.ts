export const API_VERSION = '1.0.0';
export const API_VERSION_HEADER = 'X-API-Version';

export function setAPIVersion(response: Response): void {
  response.headers.set(API_VERSION_HEADER, API_VERSION);
}

export function getAPIVersionFromRequest(request: Request): string {
  return request.headers.get(API_VERSION_HEADER) || API_VERSION;
}
