/* =============================================
   HEALTHY RITUALS — SHOPIFY STOREFRONT CLIENT
   ============================================= */

const SHOPIFY = {
  domain: 'ccht0j-m0.myshopify.com',
  token: '9bafd452810e4a6c31d8634920679b1f',
  apiVersion: '2025-10',
  productHandle: 'superfocus-coffee',
};

const ENDPOINT = `https://${SHOPIFY.domain}/api/${SHOPIFY.apiVersion}/graphql.json`;
const CART_ID_KEY = 'hr_cart_id';

async function gql(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY.token,
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    console.error('Shopify GraphQL errors:', json.errors);
    throw new Error(json.errors[0]?.message || 'Shopify request failed');
  }
  return json.data;
}

/* ---- PRODUCT QUERY ---- */
const PRODUCT_QUERY = `
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      featuredImage { url altText }
      variants(first: 10) {
        edges {
          node {
            id
            title
            availableForSale
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
          }
        }
      }
      sellingPlanGroups(first: 5) {
        edges {
          node {
            name
            sellingPlans(first: 10) {
              edges {
                node {
                  id
                  name
                  description
                  recurringDeliveries
                  priceAdjustments {
                    adjustmentValue {
                      ... on SellingPlanPercentagePriceAdjustment { adjustmentPercentage }
                      ... on SellingPlanFixedAmountPriceAdjustment { adjustmentAmount { amount currencyCode } }
                      ... on SellingPlanFixedPriceAdjustment { price { amount currencyCode } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/* ---- CART FRAGMENTS ---- */
const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
    }
    lines(first: 50) {
      edges {
        node {
          id
          quantity
          sellingPlanAllocation { sellingPlan { id name } }
          cost {
            totalAmount { amount currencyCode }
            amountPerQuantity { amount currencyCode }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              image { url altText }
              product { title handle }
            }
          }
        }
      }
    }
  }
`;

const CART_CREATE = `
  ${CART_FRAGMENT}
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

const CART_GET = `
  ${CART_FRAGMENT}
  query GetCart($id: ID!) { cart(id: $id) { ...CartFields } }
`;

const CART_LINES_ADD = `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE = `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE = `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

/* ---- PUBLIC API ---- */
const HRShopify = {
  product: null,
  cart: null,

  async loadProduct() {
    if (this.product) return this.product;
    const data = await gql(PRODUCT_QUERY, { handle: SHOPIFY.productHandle });
    if (!data.product) throw new Error('Product not found: ' + SHOPIFY.productHandle);
    this.product = data.product;
    return this.product;
  },

  async loadCart() {
    const id = localStorage.getItem(CART_ID_KEY);
    if (!id) return null;
    try {
      const data = await gql(CART_GET, { id });
      if (!data.cart) {
        localStorage.removeItem(CART_ID_KEY);
        return null;
      }
      this.cart = data.cart;
      return this.cart;
    } catch (e) {
      localStorage.removeItem(CART_ID_KEY);
      return null;
    }
  },

  async addLine(variantId, quantity, sellingPlanId) {
    const line = { merchandiseId: variantId, quantity };
    if (sellingPlanId) line.sellingPlanId = sellingPlanId;

    if (!this.cart) {
      const data = await gql(CART_CREATE, { input: { lines: [line] } });
      const errors = data.cartCreate.userErrors;
      if (errors?.length) throw new Error(errors[0].message);
      this.cart = data.cartCreate.cart;
      localStorage.setItem(CART_ID_KEY, this.cart.id);
    } else {
      const data = await gql(CART_LINES_ADD, { cartId: this.cart.id, lines: [line] });
      const errors = data.cartLinesAdd.userErrors;
      if (errors?.length) throw new Error(errors[0].message);
      this.cart = data.cartLinesAdd.cart;
    }
    return this.cart;
  },

  async updateLineQty(lineId, quantity) {
    if (!this.cart) return null;
    if (quantity <= 0) return this.removeLine(lineId);
    const data = await gql(CART_LINES_UPDATE, {
      cartId: this.cart.id,
      lines: [{ id: lineId, quantity }],
    });
    this.cart = data.cartLinesUpdate.cart;
    return this.cart;
  },

  async removeLine(lineId) {
    if (!this.cart) return null;
    const data = await gql(CART_LINES_REMOVE, {
      cartId: this.cart.id,
      lineIds: [lineId],
    });
    this.cart = data.cartLinesRemove.cart;
    return this.cart;
  },

  formatPrice(amount, currency = 'USD') {
    const n = parseFloat(amount);
    if (isNaN(n)) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency, minimumFractionDigits: 2,
    }).format(n);
  },

  pickVariant() {
    return this.product?.variants?.edges?.[0]?.node || null;
  },

  pickSellingPlan() {
    const groups = this.product?.sellingPlanGroups?.edges || [];
    for (const g of groups) {
      const plan = g.node.sellingPlans?.edges?.[0]?.node;
      if (plan) return plan;
    }
    return null;
  },

  /* Compute subscription price for a given variant + plan */
  computePlanPrice(variant, plan) {
    if (!variant || !plan) return null;
    const base = parseFloat(variant.price.amount);
    const currency = variant.price.currencyCode;
    const adj = plan.priceAdjustments?.[0]?.adjustmentValue;
    if (!adj) return { amount: base, currency };
    if (typeof adj.adjustmentPercentage === 'number') {
      return { amount: base * (1 - adj.adjustmentPercentage / 100), currency };
    }
    if (adj.price) {
      return { amount: parseFloat(adj.price.amount), currency: adj.price.currencyCode };
    }
    if (adj.adjustmentAmount) {
      return { amount: base - parseFloat(adj.adjustmentAmount.amount), currency };
    }
    return { amount: base, currency };
  },

  planSavingPercent(plan) {
    const adj = plan?.priceAdjustments?.[0]?.adjustmentValue;
    return typeof adj?.adjustmentPercentage === 'number' ? adj.adjustmentPercentage : null;
  },
};

window.HRShopify = HRShopify;
