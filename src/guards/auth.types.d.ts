export type TokenSubjects = 'access' | 'refresh';

export type RolesMetadata = {
  type: TokenSubjects;
};

export type SessionPayload = {
  aid: string;
  iat: number;
  exp: number;
  sub: TokenSubjects;
};
