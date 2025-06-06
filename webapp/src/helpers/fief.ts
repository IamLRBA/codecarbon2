import { Fief, FiefUserInfo } from "@fief/fief";
import { FiefAuth, IUserInfoCache } from "@fief/fief/nextjs";

export const SESSION_COOKIE_NAME = "user_session";

export const fiefClient = new Fief({
    baseURL: process.env.FIEF_BASE_URL as string,
    clientId: process.env.FIEF_CLIENT_ID as string,
    clientSecret: process.env.FIEF_CLIENT_SECRET as string,
    requestInit: { next: { revalidate: 3600 } },
});

class MemoryUserInfoCache implements IUserInfoCache {
    private storage: Record<string, any>;

    constructor() {
        this.storage = {};
    }

    async get(id: string): Promise<FiefUserInfo | null> {
        const userinfo = this.storage[id];
        if (userinfo) {
            return userinfo;
        }
        return null;
    }

    async set(id: string, userinfo: FiefUserInfo): Promise<void> {
        this.storage[id] = userinfo;
    }

    async remove(id: string): Promise<void> {
        this.storage[id] = undefined;
    }

    async clear(): Promise<void> {
        this.storage = {};
    }
}

export const fiefAuth = new FiefAuth({
    client: fiefClient,
    sessionCookieName: SESSION_COOKIE_NAME,
    redirectURI: `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
    returnToDefault: `${process.env.NEXT_PUBLIC_BASE_URL}/home?auth=true`,
    logoutRedirectURI: `${process.env.NEXT_PUBLIC_BASE_URL}`,
    userInfoCache: new MemoryUserInfoCache(),
});
