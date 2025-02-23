import { Router } from "express"
const usersRouter = Router()

import { accessTokenValidator, filterMiddleware, verifiedUserValidator } from "~/middlewares/auth.middlewares"
import { wrapRequestHandler } from "~/utils/error-handler"
import {
  verifyEmailController,
  sendVerifyEmailController,
  forgotPasswordController,
  resetPasswordController,
  getProfileController,
  updateProfileController,
  getUserInfoController,
  followController,
  unFollowController,
  changePasswordController,
} from "~/controllers/users.controllers"
import {
  changePasswordValidator,
  followValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  unFollowValidator,
  updateProfileValidator,
  verifyEmailValidator,
} from "~/middlewares/users.middlewares"

usersRouter.post("/verify-email", verifyEmailValidator, wrapRequestHandler(verifyEmailController))
usersRouter.post("/send-verify-email", accessTokenValidator, wrapRequestHandler(sendVerifyEmailController))
usersRouter.post("/forgot-password", forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))
usersRouter.post("/reset-password", resetPasswordValidator, wrapRequestHandler(resetPasswordController))
usersRouter.get("/profile", accessTokenValidator, wrapRequestHandler(getProfileController))
usersRouter.patch(
  "/profile",
  accessTokenValidator,
  verifiedUserValidator,
  updateProfileValidator,
  filterMiddleware(["name", "date_of_birth", "bio", "location", "website", "username", "avatar", "cover_photo"]),
  wrapRequestHandler(updateProfileController),
)
usersRouter.get("/:username", wrapRequestHandler(getUserInfoController))
usersRouter.post("/follow", accessTokenValidator, verifiedUserValidator, followValidator, wrapRequestHandler(followController))
usersRouter.delete(
  "/follow/:user_id",
  accessTokenValidator,
  verifiedUserValidator,
  unFollowValidator,
  wrapRequestHandler(unFollowController),
)

usersRouter.put(
  "/change-password",
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController),
)

export default usersRouter
