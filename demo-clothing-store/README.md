<p align="center">
  <a href="https://www.medusajs.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    </picture>
  </a>
</p>
<h1 align="center">
  Medusa
</h1>

<h4 align="center">
  <a href="https://docs.medusajs.com">Documentation</a> |
  <a href="https://www.medusajs.com">Website</a>
</h4>

<p align="center">
  Building blocks for digital commerce
</p>
<p align="center">
  <a href="https://github.com/medusajs/medusa/blob/master/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
    <a href="https://www.producthunt.com/posts/medusa"><img src="https://img.shields.io/badge/Product%20Hunt-%231%20Product%20of%20the%20Day-%23DA552E" alt="Product Hunt"></a>
  <a href="https://discord.gg/xpCwq3Kfn8">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" alt="Discord Chat" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=medusajs">
    <img src="https://img.shields.io/twitter/follow/medusajs.svg?label=Follow%20@medusajs" alt="Follow @medusajs" />
  </a>
</p>

## Compatibility

This starter is compatible with versions >= 2 of `@medusajs/medusa`. 

## Getting Started

Visit the [Quickstart Guide](https://docs.medusajs.com/learn/installation) to set up a server.

Visit the [Docs](https://docs.medusajs.com/learn/installation#get-started) to learn more about our system requirements.

## SSLCommerz Integration

This starter now ships with sandbox-ready endpoints that wrap the officially supported [`sslcommerz-lts`](https://www.npmjs.com/package/sslcommerz-lts) SDK. To use them:

1. Populate the new SSL-specific keys inside `.env` (use `.env.template` as a reference). Set `SSL_MODE=sandbox` while testing, then switch to `live` with your production store credentials. Use `SSL_RETURN_URL` to control where the shopper lands after the payment gateway redirects back to your storefront.
2. Start the Medusa server (`npm run dev`). The following REST endpoints become available under the `/store/sslcommerz` namespace:
   - `POST /init`: Initialize a payment and receive the `GatewayPageURL`.
   - `POST /validate`: Validate a transaction using the `val_id` returned by SSLCommerz.
   - `POST /initiate-refund`, `POST /refund-query`.
   - `POST /transaction-query-by-transaction-id`, `POST /transaction-query-by-session-id`.
   - `POST|GET /success`, `/fail`, `/cancel`, and `POST /ipn`: Callback endpoints you can register in the SSLCommerz dashboard.
3. Point the success, fail, cancel, and IPN URLs in the SSLCommerz dashboard to the matching routes on your server (for local testing the defaults are `http://localhost:9000/store/sslcommerz/*`).
4. Attach the `pp_sslcommerz_default` payment provider to any regions that should expose SSLCommerz at checkout. The provided seed script already links the demo region, but if you're working with existing data you can update the region in Medusa Admin under **Settings → Regions**.
5. In the storefront checkout experience, selecting the "SSLCommerz" payment method will now create a payment session and redirect the shopper to the GatewayPageURL. After the payment is confirmed, SSLCommerz will hit the IPN/success routes which in turn authorize the Medusa payment session so the cart can be completed.

Each route returns the raw SSLCommerz API payload so you can plug in any custom order or cart logic that fits your workflow. Use the `validate` route (or the automatic validation inside the success/IPN handlers) to confirm every transaction before fulfilling an order.

## What is Medusa

Medusa is a set of commerce modules and tools that allow you to build rich, reliable, and performant commerce applications without reinventing core commerce logic. The modules can be customized and used to build advanced ecommerce stores, marketplaces, or any product that needs foundational commerce primitives. All modules are open-source and freely available on npm.

Learn more about [Medusa’s architecture](https://docs.medusajs.com/learn/introduction/architecture) and [commerce modules](https://docs.medusajs.com/learn/fundamentals/modules/commerce-modules) in the Docs.

## Community & Contributions

The community and core team are available in [GitHub Discussions](https://github.com/medusajs/medusa/discussions), where you can ask for support, discuss roadmap, and share ideas.

Join our [Discord server](https://discord.com/invite/medusajs) to meet other community members.

## Other channels

- [GitHub Issues](https://github.com/medusajs/medusa/issues)
- [Twitter](https://twitter.com/medusajs)
- [LinkedIn](https://www.linkedin.com/company/medusajs)
- [Medusa Blog](https://medusajs.com/blog/)
