declare module 'passport-discord' {
  import { Strategy as PassportStrategy } from 'passport-strategy';
  import { Request } from 'express';

  export interface Profile {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    email?: string;
    verified?: boolean;
    guilds?: Array<{
      id: string;
      name: string;
      icon: string | null;
      owner: boolean;
      permissions: number;
      features: string[];
    }>;
  }

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
    passReqToCallback?: false;
  }

  export interface StrategyOptionsWithRequest {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
    passReqToCallback: true;
  }

  export type VerifyCallback = (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void
  ) => void;

  export type VerifyFunctionWithRequest = (
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyCallback);
    constructor(options: StrategyOptionsWithRequest, verify: VerifyFunctionWithRequest);
    authenticate(req: Request, options?: object): void;
    name: string;
  }
}