type RateLimitMap = { [key: string]: { count: number; timestamp: number } };

const RATE_LIMIT = 40;
const TIME_WINDOW = 30 * 1000;
const requestsMap: RateLimitMap = {};

export function isRateLimited(ip: string): boolean {
  const currentTime = Date.now();

  if(!requestsMap[ip]){
    requestsMap[ip] = { count: 1, timestamp: currentTime };
    return false;
  }

  const { count, timestamp } = requestsMap[ip];
  if(currentTime - timestamp < TIME_WINDOW){
    if(count >= RATE_LIMIT){ return true; }
    requestsMap[ip].count += 1;
  } else {
    requestsMap[ip] = { count: 1, timestamp: currentTime };
  }
  return false;
}