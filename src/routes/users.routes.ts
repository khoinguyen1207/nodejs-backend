import { Router } from "express"
const usersRouter = Router()
import {
  verifyEmailController,
  loginController,
  logoutController,
  registerController,
  sendVerifyEmailController,
  forgotPasswordController,
  resetPasswordController,
  getProfileController,
  updateProfileController,
  getUserInfoController,
  followController,
  unFollowController,
} from "~/controllers/users.controllers"
import { accessTokenValidator, filterMiddleware, refreshTokenValidator, verifiedUserValidator } from "~/middlewares/auth.middlewares"
import {
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
  unFollowValidator,
  updateProfileValidator,
  verifyEmailValidator,
} from "~/middlewares/users.middlewares"
import { wrapRequestHandler } from "~/utils/error-handler"

usersRouter.post("/login", loginValidator, wrapRequestHandler(loginController))
usersRouter.post(
  "/register",
  registerValidator,
  filterMiddleware(["email", "password", "confirm_password", "name", "date_of_birth"]),
  wrapRequestHandler(registerController),
)
usersRouter.post("/logout", accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
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

export default usersRouter
