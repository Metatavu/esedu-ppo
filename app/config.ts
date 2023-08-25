import { cleanEnv, str, url } from "envalid";

type Config = {
  hostUrl: string;
  courseIds: number[];
};

const env = cleanEnv(process.env, {
  EXPO_PUBLIC_HOST_URL: url({ default: "http://localhost:3000" }),
  EXPO_PUBLIC_COURSE_IDS: str({ default: "1,2,3" })
});

const config: Config = {
  hostUrl: env.EXPO_PUBLIC_HOST_URL,
  courseIds: env.EXPO_PUBLIC_COURSE_IDS.split(",").map(Number)
};

export default config;
