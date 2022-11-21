export interface JwtPayload {
  sub: number;
  email: string;
}

export interface JwtPayloadWithRefreshToken extends JwtPayload {
  refreshToken: string;
}
