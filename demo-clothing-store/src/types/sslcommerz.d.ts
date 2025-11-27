declare module "sslcommerz-lts" {
  interface SSLCommerzResponse {
    GatewayPageURL?: string
    status?: string
    [key: string]: any
  }

  class SSLCommerzPayment {
    constructor(storeId: string, storePassword: string, isLive: boolean)

    init(payload: Record<string, any>): Promise<SSLCommerzResponse>
    validate(payload: Record<string, any>): Promise<Record<string, any>>
    initiateRefund(payload: Record<string, any>): Promise<Record<string, any>>
    refundQuery(payload: Record<string, any>): Promise<Record<string, any>>
    transactionQueryByTransactionId(
      payload: Record<string, any>
    ): Promise<Record<string, any>>
    transactionQueryBySessionId(
      payload: Record<string, any>
    ): Promise<Record<string, any>>
  }

  export = SSLCommerzPayment
}

