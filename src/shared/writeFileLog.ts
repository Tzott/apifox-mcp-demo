import fs from 'fs';
import path from 'path';

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export function writeFileLog(name: string, content: string) {
  const logFilePath = path.join(logDir, `${name}.log`);
  fs.appendFileSync(logFilePath, content);
}
