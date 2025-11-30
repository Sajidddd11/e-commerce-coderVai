"use client"

import { useState } from "react"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import ForgotPasswordPhone from "@modules/account/components/forgot-password-phone"
import VerifyOTP from "@modules/account/components/verify-otp"
import ResetPassword from "@modules/account/components/reset-password"
import {
  requestPasswordReset,
  verifyOTP,
  resetPassword,
} from "@lib/data/password-reset"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
  FORGOT_PASSWORD_PHONE = "forgot-password-phone",
  VERIFY_OTP = "verify-otp",
  RESET_PASSWORD = "reset-password",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(LOGIN_VIEW.SIGN_IN)
  const [phone, setPhone] = useState("")
  const [resetToken, setResetToken] = useState("")

  const handleRequestPasswordReset = async (email: string) => {
    const result = await requestPasswordReset(email)
    if (!result.error && result.phone) {
      setPhone(result.phone)
      setCurrentView(LOGIN_VIEW.VERIFY_OTP)
    }
    return result
  }

  const handleVerifyOTP = async (phoneNumber: string, otp: string) => {
    const result = await verifyOTP(phoneNumber, otp)
    if (result.resetToken) {
      setResetToken(result.resetToken)
      setCurrentView(LOGIN_VIEW.RESET_PASSWORD)
    }
    return result
  }

  const handleResetPassword = async (token: string, newPassword: string) => {
    const error = await resetPassword(token, newPassword)
    if (!error) {
      // Password reset successful, redirect to login
      setCurrentView(LOGIN_VIEW.SIGN_IN)
      setPhone("")
      setResetToken("")
    }
    return error
  }

  const handleResendOTP = () => {
    setCurrentView(LOGIN_VIEW.FORGOT_PASSWORD_PHONE)
  }

  const handleCancelForgotPassword = () => {
    setCurrentView(LOGIN_VIEW.SIGN_IN)
    setPhone("")
    setResetToken("")
  }

  const renderView = () => {
    switch (currentView) {
      case LOGIN_VIEW.SIGN_IN:
        return <Login setCurrentView={setCurrentView} />
      case LOGIN_VIEW.REGISTER:
        return <Register setCurrentView={setCurrentView} />
      case LOGIN_VIEW.FORGOT_PASSWORD_PHONE:
        return (
          <ForgotPasswordPhone
            requestPasswordReset={handleRequestPasswordReset}
            onSuccess={(phone) => {
              setPhone(phone)
              setCurrentView(LOGIN_VIEW.VERIFY_OTP)
            }}
            onCancel={handleCancelForgotPassword}
          />
        )
      case LOGIN_VIEW.VERIFY_OTP:
        return (
          <VerifyOTP
            phone={phone}
            verifyOTP={handleVerifyOTP}
            onSuccess={(token) => {
              setResetToken(token)
              setCurrentView(LOGIN_VIEW.RESET_PASSWORD)
            }}
            onResend={handleResendOTP}
            onCancel={handleCancelForgotPassword}
          />
        )
      case LOGIN_VIEW.RESET_PASSWORD:
        return (
          <ResetPassword
            resetToken={resetToken}
            resetPassword={handleResetPassword}
            onSuccess={() => {
              setCurrentView(LOGIN_VIEW.SIGN_IN)
              setPhone("")
              setResetToken("")
            }}
          />
        )
      default:
        return <Login setCurrentView={setCurrentView} />
    }
  }

  return <div className="w-full flex justify-start px-8 py-8">{renderView()}</div>
}

export default LoginTemplate

