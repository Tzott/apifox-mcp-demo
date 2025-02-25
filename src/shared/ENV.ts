export const ENV = {
  get APIFOX_USER_ACCESS_TOKEN() {
    return process.env.APIFOX_USER_ACCESS_TOKEN ?? '';
  },
  get PORT() {
    const port = Number(process.env.PORT);
    return Number.isNaN(port) ? 4444 : port;
  },
};
