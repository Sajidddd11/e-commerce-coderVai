"use client"

import React, { useEffect, useActionState } from "react";

import Input from "@modules/common/components/input"

import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { updateCustomerEmail } from "@lib/data/customer"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

const ProfileEmail: React.FC<MyInformationProps> = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)

  const updateCustomerEmailAction = async (
    _currentState: Record<string, unknown>,
    formData: FormData
  ) => {
    const email = formData.get("email") as string
    const res = await updateCustomerEmail(email)
    if (res.success) {
      return { success: true, error: null }
    } else {
      return { success: false, error: res.error }
    }
  }

  const [state, formAction] = useActionState(updateCustomerEmailAction, {
    error: false,
    success: false,
  })

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  const isEmailProvided = customer.email && !customer.email.endsWith("@phone.zahan.com")
  const currentEmailInfo = isEmailProvided ? customer.email : "Not provided"

  return (
    <form action={formAction} className="w-full">
      <AccountInfo
        label="Email"
        currentInfo={currentEmailInfo}
        isSuccess={successState}
        isError={!!state.error}
        errorMessage={state.error}
        clearState={clearState}
        data-testid="account-email-editor"
        hideEdit={!!isEmailProvided}
      >
        <div className="grid grid-cols-1 gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={isEmailProvided ? customer.email : ""}
            data-testid="email-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfileEmail
