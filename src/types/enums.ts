export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned,
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken,
}

export enum ErrorCodes {
  NOT_FOUND = "NOT_FOUND",
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  UNPROCESSABLE_ENTITY = "UNPROCESSABLE_ENTITY",
}

export enum MediaType {
  IMAGE,
  VIDEO,
}

export enum MediaTypeQuery {
  IMAGE = "image",
  VIDEO = "video",
}

export enum TweetAudience {
  Everyone,
  TwitterCircle,
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet,
}
