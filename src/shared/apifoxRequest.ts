import { ENV } from './ENV';
import { writeFileLog } from './writeFileLog';

export async function apifoxRequest(
  url: string,
  options: RequestInit & {
    projectId: number;
  },
) {
  const apifoxBaseURL = 'https://api.apifox.com/api';

  const response = await fetch(apifoxBaseURL + url, {
    headers: {
      'X-Apifox-Version': '2024-03-28',
      Authorization: `Bearer ${ENV.APIFOX_USER_ACCESS_TOKEN}`,
      'X-Project-Id': options.projectId.toString(),
      ...options.headers,
    },
    ...options,
  });

  const json = await response.json();
  writeFileLog(url.replace(/\//g, '-').substring(1), JSON.stringify(json, null, 4));

  return json;
}
